import { infrastructureRole } from './infrastructure'
import { supportSpecialistRole } from './support-specialist'
import { businessSystemsAnalystRole } from './business-systems-analyst'
import { itilFoundationRole } from './itil-foundation'
import { comptiaAPlusRole, comptiaCloudPlusRole, comptiaLinuxPlusRole, comptiaNetworkPlusRole, comptiaSecurityPlusRole } from './comptia-tracks'

const sourceCatalog = [
  infrastructureRole,
  supportSpecialistRole,
  businessSystemsAnalystRole,
  itilFoundationRole,
  comptiaAPlusRole,
  comptiaNetworkPlusRole,
  comptiaSecurityPlusRole,
  comptiaLinuxPlusRole,
  comptiaCloudPlusRole
]

const withCompleteGlossary = role => {
  const glossary = new Map()
  const addTerm = ([term, definition]) => {
    const key = term.trim().toLocaleLowerCase()
    if (!glossary.has(key)) glossary.set(key, [term.trim(), definition.trim()])
  }

  role.glossary.forEach(addTerm)
  role.modules.forEach(module => module.sections.forEach(lesson => {
    lesson.terms?.forEach(addTerm)
  }))

  return {
    ...role,
    glossary: [...glossary.values()].sort(([left], [right]) => left.localeCompare(right))
  }
}

export const roleCatalog = sourceCatalog.map(withCompleteGlossary)
export const getRole = roleId => roleCatalog.find(role => role.id === roleId) || roleCatalog[0]
