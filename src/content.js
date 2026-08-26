export const modules = [
  {
    id: 'foundations', number: '01', title: 'Server anatomy & the boot path', time: '35 min',
    summary: 'Learn what lives inside a server and trace power-on through the operating system.',
    objectives: ['Name the major server components', 'Explain POST, firmware, bootloader, and OS handoff', 'Separate a hardware symptom from an operating-system symptom'],
    sections: [
      { title: 'The mental model', body: 'An enterprise server is a collection of replaceable subsystems connected by the motherboard. CPUs execute instructions; DIMMs hold working data; PCIe links connect accelerators and adapters; storage persists data; power supplies convert facility power; fans remove heat; and the BMC watches all of it independently of the main operating system.' },
      { title: 'Follow the boot', body: 'Power reaches standby circuits → the BMC starts → the system powers on → BIOS/UEFI performs POST and trains memory and PCIe links → firmware selects a boot device → the bootloader starts Linux → Linux loads drivers and services. The last successful stage sharply narrows your search.' },
      { title: 'A safe diagnostic habit', body: 'Observe before changing anything. Record the symptom, timestamps, asset tag, firmware versions, LEDs, BMC events, and recent work. Change one variable at a time. A reboot or firmware update can erase evidence or introduce a second problem.' },
    ],
    interviewQuestions: ['Walk me through the server boot process from standby power to a usable Linux login.', 'A server powers on but never reaches the bootloader. How would you narrow down the failing stage?', 'How would you explain the difference between the BMC, BIOS/UEFI, bootloader, and operating system?'],
    command: 'dmidecode -t system -t baseboard -t processor -t memory', commandNote: 'Inventory the platform and map operating-system names to physical hardware.'
  },
  {
    id: 'power', number: '02', title: 'Power, thermals & physical safety', time: '30 min',
    summary: 'Diagnose power and cooling issues without creating additional risk.',
    objectives: ['Trace redundant power delivery', 'Recognize thermal throttling and airflow problems', 'Use ESD and change-control practices'],
    sections: [
      { title: 'Redundancy is not immunity', body: 'Dual PSUs usually share load and allow one feed to fail. Check both facility feeds, PDUs, cords, PSU LEDs, BMC power readings, and whether the installed PSUs match. A healthy-looking redundant PSU can hide a lost feed until the other side fails.' },
      { title: 'Heat changes symptoms', body: 'Blocked airflow, failed fans, missing blanks, dust, loose heatsinks, or high inlet temperature may cause throttling, corrected errors, shutdowns, and shortened component life. Correlate sensor history with workload and failure time.' },
      { title: 'Hands-on discipline', body: 'Confirm the correct asset, drain workload, obtain authorization, wear ESD protection, photograph cable placement, label parts, and verify service restoration. Never treat “reseat it” as a harmless first step.' },
    ], interviewQuestions: ['A dual-PSU server remains online after losing one feed. What would you check before calling the system healthy?', 'How would you determine whether repeated CPU throttling is caused by workload, airflow, or a hardware fault?', 'Describe the safety and change-control steps you would follow before replacing a power supply in production.'], command: 'ipmitool sensor list | egrep -i "temp|fan|volt|power"', commandNote: 'Review live environmental sensors; compare values with platform thresholds and history.'
  },
  {
    id: 'memory', number: '03', title: 'Memory, ECC & CPU diagnostics', time: '45 min',
    summary: 'Interpret ECC events and isolate DIMM, slot, channel, or CPU faults.',
    objectives: ['Distinguish corrected and uncorrected ECC', 'Map a logical error to a physical DIMM', 'Design a controlled swap test'],
    sections: [
      { title: 'ECC in plain English', body: 'ECC memory can detect and correct some bit errors. A corrected error is not an outage, but a rising count is predictive evidence. An uncorrected error cannot be safely repaired in flight and may trigger a machine check, crash, or DIMM disable.' },
      { title: 'Fault-domain thinking', body: 'The DIMM is only one suspect. The slot, memory channel, CPU-integrated memory controller, motherboard traces, firmware, temperature, and seating can produce similar events. First identify the physical label and inspect error rate, recurrence, and nearby sensors.' },
      { title: 'Prove, do not guess', body: 'After collecting evidence and following the vendor population rules, move the suspected DIMM to a known-good slot or place a known-good DIMM in the suspect slot. If the fault follows the DIMM, suspect the DIMM; if it stays with the slot/channel, investigate board or CPU path.' },
    ], interviewQuestions: ['Corrected ECC errors are rising on one DIMM. How would you decide whether and when to drain the host?', 'How would you distinguish a failed DIMM from a bad slot, memory channel, CPU, or motherboard?', 'What evidence would you collect before opening an OEM case for an uncorrectable memory error?'], command: 'journalctl -k | egrep -i "edac|ecc|mce|machine check"', commandNote: 'Find kernel-reported memory and machine-check events, then correlate timestamps with the BMC log.'
  },
  {
    id: 'pcie', number: '04', title: 'PCIe, GPUs & accelerators', time: '45 min',
    summary: 'Understand link training, AER errors, topology, GPUs, and risers.',
    objectives: ['Read PCIe topology and negotiated link state', 'Interpret corrected versus fatal AER events', 'Isolate device, cable, riser, slot, or board faults'],
    sections: [
      { title: 'A negotiated highway', body: 'A PCIe device trains a link at a generation and lane width supported by both endpoints. A Gen5 x16 GPU unexpectedly running at x8 or repeatedly disappearing may point to bifurcation settings, cabling, riser seating, signal integrity, power, firmware, or the device itself.' },
      { title: 'AER evidence', body: 'Advanced Error Reporting records corrected, uncorrected non-fatal, and fatal link errors. Corrected errors can be early warnings; fatal errors may remove a device. Map the BDF address to the physical topology before touching hardware.' },
      { title: 'GPU-specific checks', body: 'Capture driver state, temperatures, power, ECC counters, Xid events, topology, and workload context. GPU-dense systems add high power draw, complex cabling, and airflow sensitivity—do not assume every Xid means a failed GPU.' },
    ], interviewQuestions: ['A GPU expected to run at PCIe x16 negotiates at x8. How would you isolate the cause?', 'One GPU disappears only under load. What evidence and controlled tests would you use?', 'How do corrected, non-fatal, and fatal PCIe AER errors change your response?'], command: 'lspci -tv && lspci -vv -s <BDF>', commandNote: 'Map topology, then inspect link speed/width, capabilities, and AER status for one device.'
  },
  {
    id: 'storage', number: '05', title: 'Storage, RAID & data protection', time: '45 min',
    summary: 'Diagnose drives, backplanes, cables, controllers, and degraded arrays safely.',
    objectives: ['Explain RAID degradation and rebuild risk', 'Read SMART/NVMe health data', 'Separate a failed drive from a shared-path failure'],
    sections: [
      { title: 'Protect data first', body: 'Before pulling a drive, confirm the exact bay, array state, redundancy level, backups, rebuild policy, and active workload. Pulling the wrong disk from a degraded RAID set can turn a repair into data loss.' },
      { title: 'Drive or path?', body: 'One drive with media errors suggests the device; several drives dropping together suggests a controller, expander, backplane, cable, power, firmware, or thermal issue. Use timestamps and topology to find the shared dependency.' },
      { title: 'Health is more than “passed”', body: 'Review reallocated sectors, pending sectors, CRC/interface errors, NVMe critical warnings, spare percentage, temperature, media errors, and controller logs. Vendor thresholds and trend direction matter more than a single generic health flag.' },
    ], interviewQuestions: ['Several drives behind one backplane disappear simultaneously. How would you identify the shared fault domain?', 'What would you verify before removing a drive from a degraded RAID array?', 'SMART reports “PASSED,” but a drive keeps timing out. What other evidence would you examine?'], command: 'smartctl -x /dev/sdX  # or: nvme smart-log /dev/nvme0', commandNote: 'Collect device health without running a destructive test; preserve output with the incident.'
  },
  {
    id: 'firmware', number: '06', title: 'BIOS, BMC & firmware operations', time: '40 min',
    summary: 'Use out-of-band management and perform safe, compatible updates.',
    objectives: ['Explain BMC independence and limitations', 'Collect SEL and firmware inventory', 'Plan a low-risk firmware change'],
    sections: [
      { title: 'Your out-of-band window', body: 'The BMC remains available when the host OS is down. It exposes sensors, event logs, power controls, inventory, and a remote console through IPMI, Redfish, iDRAC, iLO, or OEM tools. Treat it as privileged infrastructure and use least access.' },
      { title: 'Logs have limits', body: 'The System Event Log may wrap, use a different clock, or contain stale events. Export it before clearing anything, verify time zones, and correlate it with Linux logs, monitoring, and maintenance records.' },
      { title: 'Firmware is a change, not a reflex', body: 'Verify model, hardware revision, dependency order, release notes, known issues, rollback support, maintenance window, redundant power, and recovery procedure. Capture settings and versions before and after; validate the actual symptom afterward.' },
    ], interviewQuestions: ['When is a firmware update an appropriate troubleshooting step, and how would you reduce its risk?', 'The BMC and Linux logs show different timestamps. How would you build a trustworthy incident timeline?', 'What can you diagnose through iDRAC, iLO, IPMI, or Redfish when the host operating system is unavailable?'], command: 'ipmitool sel elist && ipmitool mc info', commandNote: 'Export detailed hardware events and identify the management controller firmware.'
  },
  {
    id: 'linux', number: '07', title: 'Linux evidence & structured RCA', time: '50 min',
    summary: 'Build an evidence timeline and communicate a defensible root cause.',
    objectives: ['Use Linux logs and hardware tools', 'Distinguish symptom, cause, and contributing factor', 'Write a concise five-part RCA'],
    sections: [
      { title: 'Build a timeline', body: 'Start with UTC-normalized timestamps. Combine the ticket, monitoring alerts, BMC SEL, kernel journal, application impact, changes, and physical actions. A timeline exposes ordering and prevents “the last error must be the cause” reasoning.' },
      { title: 'Hypothesis-driven troubleshooting', body: 'State candidate causes, identify the evidence each predicts, and choose the least disruptive test that best separates them. Record negative evidence too. Stop when evidence supports a cause strongly enough for the risk and business impact.' },
      { title: 'RCA structure', body: 'Write: impact; detection and timeline; technical root cause; contributing factors; corrective and preventive actions with owners and dates. “Replaced motherboard” is a repair action—not a root cause.' },
    ], interviewQuestions: ['How do you distinguish a root cause from a symptom, contributing factor, and repair action?', 'Walk me through how you would build an incident timeline after an unexpected server reboot.', 'Describe a hypothesis-driven troubleshooting process for an intermittent hardware failure.'], command: 'journalctl -k -b -1 --since "2026-01-01 10:00 UTC"', commandNote: 'Inspect kernel messages from the previous boot in a bounded incident window.'
  },
  {
    id: 'rma', number: '08', title: 'RMA lifecycle, metrics & vendor cases', time: '50 min',
    summary: 'Validate failures, run warranty cases, qualify replacements, and improve fleet reliability.',
    objectives: ['Create an evidence-rich vendor claim', 'Track chain of custody and SLA', 'Calculate actionable reliability metrics'],
    sections: [
      { title: 'The lifecycle', body: 'Triage → preserve evidence → isolate and validate → check warranty/entitlement → open vendor case → meet requested diagnostics → receive and inspect replacement → install and validate → return failed part → update inventory → close only after production observation.' },
      { title: 'A case vendors can act on', body: 'Include asset and serial numbers, part number, firmware bundle, exact symptom, business impact, timestamps, logs, diagnostics, isolation steps, reproduction, photos if relevant, shipping details, and a clear requested action. Avoid vague claims such as “server is broken.”' },
      { title: 'Turn tickets into reliability', body: 'Track time to acknowledge, time to isolate, vendor response, time to replacement, MTTR, failure rate by model/lot/age, no-fault-found rate, repeat RMA rate, and recurrence after repair. Segment before drawing conclusions; more failures may simply reflect a larger installed base.' },
    ], interviewQuestions: ['Walk me through the complete RMA lifecycle from initial symptom to verified production recovery.', 'A server has received three motherboard replacements in 60 days. How would you escalate the repeat failure?', 'Which RMA and reliability metrics would you report, and how would you prevent misleading conclusions?'], command: 'Repeat RMA rate = repeat RMAs ÷ completed RMAs × 100', commandNote: 'Define the repeat window and denominator consistently so the metric drives corrective action.'
  },
]

export const quizQuestions = [
  { q: 'A server has rising corrected ECC errors on DIMM A1 but is still online. What is the best first move?', choices: ['Immediately replace the motherboard', 'Capture and correlate BMC/kernel evidence and map A1 physically', 'Clear the SEL and reboot', 'Ignore all corrected errors'], answer: 1, why: 'Preserve evidence and confirm the fault domain before changing state. Corrected errors are predictive, not proof of one failed part.' },
  { q: 'Which component provides out-of-band sensors and console access even when the host OS is down?', choices: ['Bootloader', 'BMC', 'RAID virtual disk', 'CPU cache'], answer: 1, why: 'The baseboard management controller operates independently from the host OS.' },
  { q: 'Several drives on one backplane disappear at the same timestamp. What should lead your hypothesis list?', choices: ['Every drive failed independently', 'A shared path such as backplane, cable, controller, power, or firmware', 'Linux permissions', 'A bad keyboard'], answer: 1, why: 'Simultaneous correlated failures point toward a shared dependency.' },
  { q: 'Before removing a drive from a degraded RAID array, what matters most?', choices: ['Fan speed only', 'Confirm exact bay, redundancy state, backups, and change authorization', 'Clear SMART data', 'Update every firmware component'], answer: 1, why: 'A wrong-disk pull can cause data loss, so identity and data protection come first.' },
  { q: 'A PCIe GPU expected at x16 negotiates x8. Which tool helps confirm link state and topology?', choices: ['lspci -tv and lspci -vv', 'passwd', 'df -h only', 'curl localhost'], answer: 0, why: 'lspci exposes the PCIe tree and negotiated link capabilities/status.' },
  { q: 'What is the strongest evidence that a memory fault belongs to a DIMM rather than its slot?', choices: ['The server rebooted once', 'The fault follows the DIMM during a controlled swap', 'The DIMM label is first alphabetically', 'The BMC is reachable'], answer: 1, why: 'A controlled A/B swap separates the component from the slot/channel fault domain.' },
  { q: 'Which statement is a root cause rather than only a repair action?', choices: ['We replaced the riser', 'Signal loss from a cracked riser connector caused link drops; chassis flex was the contributor', 'The ticket was closed', 'A technician reseated the card'], answer: 1, why: 'A root cause explains the failure mechanism; replacement and reseating are corrective actions.' },
  { q: 'What should happen before clearing a BMC System Event Log?', choices: ['Export it and confirm timestamps', 'Nothing; it is never useful', 'Delete the Linux journal too', 'Power-cycle both PDUs'], answer: 0, why: 'The SEL is volatile incident evidence and may wrap or use a different clock.' },
  { q: 'A replacement part arrives from the OEM. When is the RMA truly complete?', choices: ['When the box arrives', 'After inspection, installation, diagnostics, production observation, return shipment, and record updates', 'When the old part is removed', 'When the vendor sends an email'], answer: 1, why: 'End-to-end ownership includes replacement qualification, service validation, chain of custody, and inventory closure.' },
  { q: 'Which metric can expose weak diagnosis or ineffective repairs?', choices: ['Rack height', 'Repeat RMA rate', 'Number of command aliases', 'Cable color count'], answer: 1, why: 'Repeat RMAs reveal recurrence on the same asset/component within a defined window.' },
  { q: 'What makes a firmware update defensible during troubleshooting?', choices: ['Firmware is always the cause', 'Compatibility, release-note relevance, rollback/recovery plan, controlled window, and before/after validation', 'The newest version number looks better', 'It avoids collecting logs'], answer: 1, why: 'Firmware changes carry risk and need an evidence-based reason and recovery path.' },
  { q: 'L1 asks for help with a high-impact incident. What is the best escalation behavior?', choices: ['Take over silently', 'Stabilize impact, clarify ownership, preserve evidence, communicate cadence, and coach through the runbook', 'Wait for the vendor before looking', 'Replace multiple parts at once'], answer: 1, why: 'Strong escalation combines technical control, communication, evidence preservation, and team development.' },
]

export const glossary = [
  ['AER', 'Advanced Error Reporting: PCIe error telemetry.'], ['BDF', 'PCIe bus:device.function address.'], ['BMC', 'Independent management controller for sensors, logs, console, and power.'], ['ECC', 'Memory error detection/correction that adds check bits.'], ['FRU', 'Field-replaceable unit, such as a PSU, fan, drive, or board.'], ['iDRAC / iLO', 'Dell and HPE out-of-band management platforms.'], ['IPMI', 'Standard interface for out-of-band hardware management.'], ['MTBF', 'Mean time between failures; a population reliability estimate.'], ['MTTR', 'Mean time to repair or restore, defined consistently by the organization.'], ['NFF', 'No fault found: a returned part that does not reproduce the reported fault.'], ['POST', 'Power-on self-test performed during firmware initialization.'], ['RCA', 'Root cause analysis: evidence-backed explanation and prevention plan.'], ['Redfish', 'Modern RESTful standard for hardware management.'], ['RMA', 'Return merchandise authorization for warranty replacement/repair.'], ['SEL', 'BMC System Event Log.'], ['SMART', 'Storage device health and error telemetry.'], ['UEFI', 'Modern system firmware interface that initializes hardware and boots software.'],
]

export const scenarios = [
  { title: 'The rising ECC count', prompt: 'Monitoring shows corrected ECC errors on DIMM A1 rose from 2 to 200 in six hours. The host runs production workloads.', steps: ['State your immediate risk and whether you would drain the host.', 'List evidence you collect before rebooting or reseating.', 'Explain how you distinguish DIMM, slot, channel, CPU, and board.', 'Draft the evidence summary for an OEM case.'], model: 'I would assess error velocity and workload criticality, preserve SEL/kernel/EDAC/MCE data and sensor history, map A1 using the service guide, check firmware and recent changes, then schedule a controlled isolation test. I would not claim the DIMM is bad until the fault follows it or vendor diagnostics support that conclusion.' },
  { title: 'The disappearing GPU', prompt: 'One GPU in an eight-GPU server disappears under load and returns after a cold boot.', steps: ['Identify evidence from Linux, BMC, and the GPU vendor tool.', 'Map shared power, PCIe switch, cable, riser, and thermal dependencies.', 'Propose the least disruptive separating tests.', 'Define pass criteria for the replacement.'], model: 'I would correlate Xid/AER events, link state, power and thermal history with workload time, then compare the affected topology with healthy GPUs. Controlled cable/slot/device substitution plus a representative load test can show whether the issue follows the GPU or stays with the path.' },
  { title: 'The repeat RMA', prompt: 'A server has received three system-board replacements in 60 days for intermittent reboots.', steps: ['Explain why another board swap is insufficient.', 'Build a cross-case evidence timeline.', 'Name fleet data you would compare.', 'Describe the vendor escalation and corrective action request.'], model: 'I would treat this as a systemic or misdiagnosed fault: compare power, firmware, CPUs/DIMMs/risers retained across swaps, chassis condition, environment, service actions, and sibling assets from the same lot. I would escalate a consolidated case asking for engineering review, failure analysis, and an agreed corrective-action plan.' },
]
