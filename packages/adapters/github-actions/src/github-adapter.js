import YAML from "yaml";
function parseYaml(content) {
    return YAML.parse(content);
}
export class GitHubActionsAdapter {
    platform = "github-actions";
    supports(filename, content) {
        const isYamlExt = /\.ya?ml$/i.test(filename);
        const hasGitHubKeywords = content.includes("runs-on") || content.includes("steps:");
        const isInWorkflowDir = filename.includes(".github/workflows");
        return (isYamlExt && hasGitHubKeywords) || isInWorkflowDir;
    }
    parse(content, filename = "workflow.yml") {
        const diagnostics = [];
        let parsed;
        try {
            parsed = parseYaml(content);
        }
        catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Failed to parse YAML content";
            return {
                success: false,
                diagnostics: [
                    {
                        ruleId: "GHA-001",
                        severity: "error",
                        message: `Syntax Error: ${errorMsg}`,
                    },
                ],
            };
        }
        if (!parsed || typeof parsed !== "object") {
            return {
                success: false,
                diagnostics: [
                    {
                        ruleId: "GHA-002",
                        severity: "error",
                        message: "Document is empty or invalid YAML object hierarchy.",
                    },
                ],
            };
        }
        const workflowName = parsed.name || filename.replace(/\.[^/.]+$/, "");
        const triggers = [];
        if (typeof parsed.on === "string") {
            triggers.push(parsed.on);
        }
        else if (Array.isArray(parsed.on)) {
            triggers.push(...parsed.on);
        }
        else if (parsed.on && typeof parsed.on === "object") {
            triggers.push(...Object.keys(parsed.on));
        }
        const rawJobs = parsed.jobs || {};
        const normalizedJobs = {};
        for (const [jobId, jobData] of Object.entries(rawJobs)) {
            if (!jobData || typeof jobData !== "object") {
                diagnostics.push({
                    ruleId: "GHA-003",
                    severity: "warning",
                    message: `Job definition for '${jobId}' is invalid or empty.`,
                    affectedJobId: jobId,
                });
                continue;
            }
            let dependencies = [];
            if (typeof jobData.needs === "string") {
                dependencies = [jobData.needs];
            }
            else if (Array.isArray(jobData.needs)) {
                dependencies = jobData.needs.filter(Boolean);
            }
            const steps = (jobData.steps || []).map((step, idx) => ({
                id: step.id || `step-${idx + 1}`,
                name: step.name ||
                    step.run?.slice(0, 30) ||
                    step.uses ||
                    `Step ${idx + 1}`,
                run: step.run,
                uses: step.uses,
                with: step.with,
            }));
            let runner;
            if (typeof jobData["runs-on"] === "string") {
                runner = jobData["runs-on"];
            }
            else if (Array.isArray(jobData["runs-on"])) {
                runner = jobData["runs-on"].join(", ");
            }
            let environment;
            if (typeof jobData.environment === "string") {
                environment = jobData.environment;
            }
            else if (jobData.environment &&
                typeof jobData.environment === "object") {
                environment = jobData.environment.name;
            }
            let matrixConfig = undefined;
            if (jobData.strategy?.matrix &&
                typeof jobData.strategy.matrix === "object") {
                const matrixKeys = Object.keys(jobData.strategy.matrix);
                const totalCombinations = matrixKeys.reduce((acc, key) => {
                    const val = jobData.strategy?.matrix?.[key];
                    return acc * (Array.isArray(val) && val.length > 0 ? val.length : 1);
                }, 1);
                matrixConfig = {
                    matrixKeys,
                    totalCombinations,
                };
            }
            normalizedJobs[jobId] = {
                id: jobId,
                displayName: jobData.name || jobId,
                dependencies,
                steps,
                condition: jobData.if,
                environment,
                runner,
                matrix: matrixConfig,
            };
        }
        const workflow = {
            schemaVersion: "1.0.0",
            platform: "github-actions",
            name: workflowName,
            path: filename,
            triggers,
            jobs: normalizedJobs,
        };
        return {
            success: true,
            workflow,
            diagnostics,
        };
    }
}
//# sourceMappingURL=github-adapter.js.map