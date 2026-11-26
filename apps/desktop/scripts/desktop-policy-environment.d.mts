/** Required deployment-selected metadata for mandatory-update policy requests. */
export interface DesktopPolicyEnvironment {
  origin: string
  allowedPageOrigins: string[]
  allowedAuthOrigins?: string[]
  authentication: 'anonymous' | 'feishu-test'
  [key: string]: unknown
}

/**
 * Resolve policy settings before artifact preparation or signing.
 * @param environment File-owned release settings; only the selected origin is required.
 * @param platform Target platform; Linux has no policy client, so policy settings there are a configuration error.
 * @returns Policy metadata with deployment-selected origin and authentication, or undefined for Linux.
 */
export function resolveDesktopPolicyEnvironment(environment: NodeJS.ProcessEnv, platform?: 'win32' | 'darwin' | 'linux'): DesktopPolicyEnvironment | undefined
