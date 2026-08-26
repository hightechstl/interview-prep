import { infrastructureRole } from './infrastructure'

export const roleCatalog = [infrastructureRole]
export const getRole = roleId => roleCatalog.find(role => role.id === roleId) || roleCatalog[0]
