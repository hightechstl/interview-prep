import { infrastructureRole } from './infrastructure'
import { supportSpecialistRole } from './support-specialist'

export const roleCatalog = [infrastructureRole, supportSpecialistRole]
export const getRole = roleId => roleCatalog.find(role => role.id === roleId) || roleCatalog[0]
