/** Validate machine-owned Linux packaging settings and record a manual Actions build version. */
import { appendFileSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { desktopTargetPlatform, resolveDesktopBuildTarget } from './desktop-build-paths.mjs'
import { desktopCiVersion } from './desktop-ci-version.mjs'
import { loadDesktopPackageEnvironment, validateDesktopPackageEnvironment } from './desktop-package-environment.mjs'

const target = desktopTargetPlatform(resolveDesktopBuildTarget(process.env))
if (target.platform !== 'linux') throw new Error('Linux CI requires a Linux target')
const appRoot = resolve(import.meta.dirname, '..')
const product = JSON.parse(readFileSync(resolve(appRoot, 'package.json'), 'utf8'))
const version = desktopCiVersion(process.env, product.version)
if (!process.env.DSH_PACKAGING_PRESET) throw new Error('Select a machine preset')
const environment = loadDesktopPackageEnvironment('linux', process.env, appRoot)
for (const [name, value] of Object.entries(environment)) {
  if (/KEY|TOKEN|PASSWORD|SECRET/iu.test(name) && value) {
    const escaped = value.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A')
    process.stdout.write(`::add-mask::${escaped}\n`)
  }
}
validateDesktopPackageEnvironment(environment, target)
if (!process.env.GITHUB_OUTPUT || !process.env.GITHUB_STEP_SUMMARY) throw new Error('Run this adapter from GitHub Actions')
appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\nartifacts=artifacts\nmode=unsigned\n`)
appendFileSync(process.env.GITHUB_STEP_SUMMARY, `Linux ${target.arch} unsigned AppImage\n\nVersion: ${version}\n\nCommit: ${execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()}\n\nChannel: ${process.env.DSH_DESKTOP_UPDATE_CHANNEL}\n\nSource: ${process.env.PACKAGE_SOURCE_REF}\n\nPreset: ${process.env.DSH_PACKAGING_PRESET}\n\nWARNING: unsigned build; internal debugging only. Not qualified for distribution or update publishing.\n`)
