#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const packageJson = require('../package.json');

const versions = packageJson.versions;
const sharpVersion = execSync('npm view sharp version', { encoding: 'utf8' }).replace(/[\s]/g, '');
const nodeVersion = '8.0.0';

if (sharpVersion === versions.sharp && nodeVersion === versions.node) {
    console.log('Update is not required. Package already up-to-date');
    process.exit(0);
}

if (sharpVersion !== versions.sharp) {
    console.log(`New version of sharp module found ${sharpVersion}. Currently used ${versions.sharp}`);
    versions.sharp = sharpVersion;
}

if (nodeVersion !== versions.node) {
    console.log(`New version of node docker image found ${nodeVersion}. Currently used ${versions.node}`);
    versions.node = nodeVersion;
}

const packageJsonPath = path.join(__dirname, '../package.json');
const dockerfileTemplatePath = path.join(__dirname, '../Dockerfile.template');
const dockerfilePath = path.join(__dirname, '../Dockerfile');
const dockerfileTemplate = fs.readFileSync(dockerfileTemplatePath, 'utf8');
const context = {
    NODE_VERSION: nodeVersion,
    SHARP_VERSION: sharpVersion,
};

fs.writeFileSync(dockerfilePath, renderTemplate(dockerfileTemplate, context));
console.log('Dockerfile updated');

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('package.json updated');

const commitComment = `node v${nodeVersion} sharp v${sharpVersion}`;
const tagName = `${nodeVersion}-${sharpVersion}`;
const tagComment = `node v${nodeVersion} sharp v${sharpVersion}`;

execSync('git add --all', { stdio: 'inherit' });
execSync(`git commit -m "${commitComment}"`, { stdio: 'inherit' });
execSync(`git tag -a ${tagName} -m "${tagComment}"`, { stdio: 'inherit' });
execSync('git push --follow-tags -u origin master', { stdio: 'inherit' });

function renderTemplate(template, context) {
    const sandbox = Object.assign({ result: null }, context || {});
    const script = new vm.Script(`result = \`${template}\`;`);
    const ctx = vm.createContext(sandbox);
    script.runInContext(ctx);
    return sandbox.result;
}
