import { infrastructureRole } from './infrastructure'
import { supportSpecialistRole } from './support-specialist'
import { itilFoundationRole } from './itil-foundation'

export const roleCatalog = [infrastructureRole, supportSpecialistRole, itilFoundationRole]
export const getRole = roleId => roleCatalog.find(role => role.id === roleId) || roleCatalog[0]
