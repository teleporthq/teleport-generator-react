"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function packageRenderer(project) {
    var pkg = {
        name: project.slug,
        author: project.userSlug || 'Unknown',
        version: project.version || '0.0.1',
        description: project.description || '',
        scripts: {
            dev: "next",
            build: "next build",
            start: "next start"
        },
        license: "ISC",
        dependencies: {
            "next": "^5.1.0",
            "react": "^16.3.0",
            "react-dom": "^16.3.0"
        }
    };
    return JSON.stringify(pkg, null, 2);
}
exports.default = packageRenderer;
//# sourceMappingURL=package.js.map