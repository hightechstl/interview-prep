import { infrastructureRole } from './infrastructure'
import { supportSpecialistRole } from './support-specialist'
import { itilFoundationRole } from './itil-foundation'
import { comptiaAPlusRole, comptiaCloudPlusRole, comptiaLinuxPlusRole, comptiaNetworkPlusRole, comptiaSecurityPlusRole } from './comptia-tracks'

export const roleCatalog = [
  infrastructureRole,
  supportSpecialistRole,
  itilFoundationRole,
  comptiaAPlusRole,
  comptiaNetworkPlusRole,
  comptiaSecurityPlusRole,
  comptiaLinuxPlusRole,
  comptiaCloudPlusRole
]
export const getRole = roleId => roleCatalog.find(role => role.id === roleId) || roleCatalog[0]
