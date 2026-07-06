// Chapter notes — detailed study reference, from the course notes
// (Digital Forensics, Investigation, and Response, Ch 1-4).
// Rendered in the in-game Field Notes overlay. Each chapter -> sections ->
// html body. `case` links a chapter to the case whose world uses it.

const NOTES = [
  {
    id: 'ch1',
    num: 1,
    title: 'Forensic Fundamentals',
    subtitle: 'Concepts, the expert, evidence, hardware, file systems, networks & law',
    relatedCases: ['case1', 'case2', 'case3', 'case4'],
    sections: [
      {
        h: 'What is forensics / computer forensics / digital forensics?',
        body: `
<p><b>Forensics:</b> the use of analytical and investigative techniques to identify, collect, examine, and preserve computer-based material for presentation as evidence in a court of law.</p>
<p><b>Digital forensics</b> expands computer forensics to smartphones, smart watches, and other current and forthcoming digital media/devices.</p>
<p><b>Goal:</b> recover, analyze, and present computer-based material so it can be used as evidence in court. Emphasis is on the <b>integrity and security of evidence</b>. Specialists must follow stringent guidelines and never take shortcuts.</p>
<p>It is a <b>science</b> requiring understanding of scientific methods and relevant disciplines — computer hardware, operating systems, and networks.</p>`,
      },
      {
        h: 'The three-stage process',
        body: `
<ul>
<li><b>Collecting</b> — evidence must be collected using specific procedures; the method directly affects admissibility.</li>
<li><b>Analyzing</b> — the hardest, most time-consuming stage. Treat it like a complex puzzle; examine evidence meticulously and consider alternative explanations before concluding (Sherlock Holmes approach).</li>
<li><b>Presenting</b> — deliver findings via an expert report or expert testimony. Translate complex technical info into clear, plain English; avoid jargon; use visuals.</li>
</ul>`,
      },
      {
        h: 'Expert report & expert testimony',
        body: `
<p><b>Expert testimony:</b> testimony of an expert witness who testifies on the basis of scientific/technical knowledge relevant to a case (not personal experience).</p>
<p><b>Expert report:</b> a formal document documenting the investigation — a list of all tests conducted plus the specialist's CV. <b>Anything you plan to testify about must be in the report</b> — experts can only testify on matters included in it. Be exhaustive; include peripheral findings.</p>
<ul>
<li>Must detail qualifications, experience, tools and techniques; methodology must be robust enough for another competent analyst to replicate.</li>
<li>Avoid "junk science" — opinions must be supported by verifiable sources, not just personal experience (aligns with Daubert).</li>
<li>Reports must be error-free and proofread by expert and attorney.</li>
</ul>
<p><b>Federal Rules of Evidence:</b> Rule 702 (admissibility of expert testimony — sufficient facts, reliable methods, reliably applied), 703 (bases of expert opinion), 704 (opinion on ultimate issue), 705 (disclosing underlying facts), 706 (court-appointed expert), 401 (relevant evidence). Honesty is paramount — perjury is a felony and destroys credibility.</p>`,
      },
      {
        h: 'Types of digital evidence',
        body: `
<p>Admissibility hinges on an unbroken <b>chain of custody</b>. Four types of evidence courts consider:</p>
<ol>
<li><b>Real evidence</b> — physical objects (e.g., a laptop with fingerprints).</li>
<li><b>Documentary evidence</b> — stored info (emails, logs, databases); must authenticate genuineness.</li>
<li><b>Testimonial evidence</b> — info from forensic specialists (expert testimony).</li>
<li><b>Demonstrative evidence</b> — explains other evidence, often visually (charts, graphics).</li>
</ol>`,
      },
      {
        h: 'Scope challenges',
        body: `
<p>Large volumes of data, system complexity, distributed (cross-jurisdictional / global) crime scenes, growing caseloads and limited resources.</p>
<p><b>Chain of custody:</b> the continuity of control of evidence that accounts for everything that happened to it between original collection and appearance in court, preferably unaltered.</p>
<p><b>Daubert standard:</b> only methods and tools widely accepted in the scientific community can be used in court.</p>`,
      },
      {
        h: 'Types of digital forensics analysis',
        body: `
<ul>
<li><b>Disk forensics</b> — storage media, recovery of deleted data.</li>
<li><b>Email forensics</b> — tracing email origins/content.</li>
<li><b>Network forensics</b> — monitoring/analyzing traffic.</li>
<li><b>Internet forensics</b> — reconstructing online activity.</li>
<li><b>Software (malware) forensics</b> — analyzing malicious code.</li>
<li><b>Live system forensics</b> — examining real-time memory.</li>
<li><b>Cell-phone forensics</b> — mobile content (FISA, PATRIOT Act).</li>
</ul>`,
      },
      {
        h: 'General guidelines',
        body: `
<ol>
<li><b>Chain of Custody</b> — most vital principle; continuous documented record from seizure to court. A break can exclude evidence.</li>
<li><b>Don't Touch the Suspect Drive</b> — minimize interaction with the original; make a forensic copy (FTK, EnCase) and work from it.</li>
<li><b>Document Trail</b> — record who was present, what was connected, screen content, tools/techniques, who accessed evidence. Err toward over-documentation.</li>
<li><b>Secure the Evidence</b> — locked rooms, restricted access, safes, need-to-know.</li>
</ol>`,
      },
      {
        h: 'Hardware — memory & volatility',
        body: `
<p><b>Volatile memory</b> requires power to hold data. RAM is highly volatile; EEPROM is very nonvolatile.</p>
<p><b>RAM types:</b> EDO DRAM, Burst EDO (BEDO), Asynchronous (ADRAM), Synchronous (SDRAM), Double Data Rate (DDR/DDR2/3/4/5).</p>
<p><b>By volatility:</b> RAM (volatile, easily read/written), ROM (permanent, embedded instructions), PROM (program once), EPROM (erase & reprogram), EEPROM (electrically erasable — stores BIOS).</p>
<p><b>BIOS:</b> basic instructions stored on a chip for booting the computer.</p>`,
      },
      {
        h: 'Hardware — drives & storage structure',
        body: `
<p><b>Interfaces:</b> SCSI (older, servers, up to 16 chained, needs termination), IDE/EIDE/PATA (40/80-pin), SATA (most common today, no jumpers), Serial SCSI (up to 65,537 devices, no termination), SSD (NAND flash, no moving parts, wear leveling, limited write cycles).</p>
<p><b>HDD structure:</b> Sectors (typically 512 bytes; newer 4096), Clusters (groups of sectors; unused space wasted), Tracks, Drive geometry (heads, cylinders, sectors/track).</p>
<p><b>Slack space:</b> unused space at the end of a file's cluster — can hide data. On SSDs, wear leveling makes slack less relevant for hiding.</p>
<p><b>Low-level format</b> creates physical structure; <b>high-level format</b> sets up an empty file system + boot sector (quick format).</p>`,
      },
      {
        h: 'Software, files & file systems',
        body: `
<p><b>OS relevance:</b> Windows (Registry stores settings/devices; index.dat, cookies, history), Linux (open-source, Kali/BackTrack, shell-centric), macOS (FreeBSD-based, UNIX-like — Linux command-line techniques apply).</p>
<p><b>Files:</b> extensions can change but not the structure. The <b>file header</b> (starts at first byte, key to file carving) gives accurate info. ELF (UNIX executables), PE (Windows executables/DLLs, from COFF). Office files use a GUID.</p>
<p><b>File systems:</b> journaling (fault-tolerant, logs transactions — physical vs. logical journaling) vs. non-journaling. FAT (FAT16/32), NTFS (1993, large volumes), ReFS (resilient, checksums), APFS (Apple, SSD-optimized), EXT (Linux, EXT4), ReiserFS, Berkeley Fast File System.</p>`,
      },
      {
        h: 'Networks & addressing',
        body: `
<p>Data is <b>at rest</b> (stored) or <b>in motion</b> (transmitted). Know OSI and IETF models.</p>
<ul>
<li><b>Physical ports</b> — OSI Layer 1, Layer 1 frames.</li>
<li><b>MAC address</b> — unique 6-byte (48-bit) physical address; first 3 bytes = vendor. Can be duplicated intentionally or by poor QC.</li>
<li><b>IP address</b> — logical, easily changeable. IPv4 (32-bit), IPv6.</li>
<li><b>Logical port numbers</b> — channels used with IP for communication.</li>
<li><b>URLs / DNS</b> — names instead of IPs; name-to-IP mapping changes create forensic challenges.</li>
</ul>
<p><b>Utilities:</b> ipconfig (/ifconfig) — IP + default gateway; ping — reachability + round-trip + TTL; tracert/traceroute — path/hops (not reliable for forensics).</p>`,
      },
      {
        h: 'Obscured information & anti-forensics',
        body: `
<p><b>Obscured info:</b> data hidden/unreadable via encryption, steganography, compression, or proprietary formats. May require live extraction if encryption is active.</p>
<p><b>Anti-forensics:</b> perpetrators actively hinder investigation — using public networks (libraries, cafes), destroying service info. Techniques: <b>data destruction</b> (wiping/overwriting/damaging), <b>data hiding</b> (reserved sectors, hidden partitions, altered names), <b>data transformation</b> (encryption, steganography), <b>file system alteration</b> (corrupting NTFS structures).</p>`,
      },
      {
        h: 'Law: Daubert, US laws & warrants',
        body: `
<p><b>Daubert standard:</b> judges assess whether expert scientific testimony is admissible — testability, peer review, error rates, established standards, general acceptance.</p>
<p><b>Key US laws:</b> Federal Privacy Act (1974), Privacy Protection Act (1980), CALEA (1994), Unlawful Access to Stored Communications (18 U.S.C. §2701), ECPA (1986), Computer Security Act (1987), FISA (1978), COPPA (1998), Communications Decency Act (1996), Telecommunications Act (1996), Wireless Communications & Public Safety Act (1999), USA PATRIOT Act, Sarbanes-Oxley (2002), 18 USC 1030 (fraud/hacking), DMCA (1998), 18 USC §1028A (identity theft).</p>
<p><b>Warrants (4th Amendment):</b> generally required unless plain sight or valid consent. Consent must be by the proper party. Warrantless exceptions: border crossings, imminent evidence destruction. <b>Don't exceed the scope of a warrant</b> (US v. Schlingloff — child porn found within a valid identity-theft search was admissible).</p>`,
      },
      {
        h: 'Federal guidelines',
        body: `
<p><b>FBI:</b> preserve system state, back up all data/logs, activate auditing, always work with copies not originals.</p>
<p><b>Secret Service "golden rules":</b> ensure scene safety; preserve evidence immediately; confirm legal basis (plain view/warrant/consent); if the computer is off, leave it off; if on, properly shut down / prepare for transport; if destruction suspected, pull the plug; photograph screens + location + attached media; assess special legal/privacy considerations.</p>
<p><b>RCFL Program:</b> national network of FBI-supported forensic labs and training centers.</p>`,
      },
    ],
  },

  {
    id: 'ch2',
    num: 2,
    title: 'Computer Crime & Forensics',
    subtitle: 'How each crime shapes the investigation',
    relatedCases: ['case1', 'case2', 'case3'],
    sections: [
      {
        h: 'How computer crime affects forensics',
        body: `
<p><b>Roles of computers in crime:</b> the <b>target</b> (hacking), the <b>instrument</b> (used to break into another system), or an <b>evidence repository</b>. One computer can play multiple roles.</p>
<p>Understanding the role tailors search strategy — password-cracking software (instrument) vs. audit logs (target). Different crimes yield different evidence (identity theft → email; hacking → firewall/IDS logs).</p>`,
      },
      {
        h: 'Identity theft',
        body: `
<p>Wrongfully obtaining and using someone's personal data, usually for financial gain.</p>
<ul>
<li><b>Phishing</b> — deceptive emails posing as trusted orgs, with malicious links to fake sites. <b>Spear phishing</b> targets specific high-value individuals with researched, personalized lures. Relies on social engineering (trust + urgency).</li>
<li><b>Spyware</b> — monitors activity, screenshots, keylogging; ~80% of internet-connected computers believed infected. Can be legal (parents on minors, employers on company equipment: Teen Safe, Web Watcher, ICU, WorkTime).</li>
<li><b>Discarded info / dumpster diving</b> — finding un-shredded documents; little forensic trace, implies a local perpetrator.</li>
</ul>
<p><b>Forensics:</b> check the victim's computer for spyware (leaves a trace when sending data out); examine email and browsing history. <b>Monitoring limits:</b> employers only on company systems; parents only on minors (ends at 18); illegal to monitor other adults. Prevention: shred/burn documents.</p>`,
      },
      {
        h: 'Hacking',
        body: `
<p>Two meanings: (1) experimenting to understand a system, (2) circumventing security (the relevant one here).</p>
<p><b>SQL Injection (SQLi):</b> inserting malicious SQL into input fields when apps concatenate user input into queries. Classic: <code>' OR 1=1 --</code> makes the WHERE clause always true, bypassing login. Impact: unauthorized data access, modification/deletion, admin control.</p>
<p><b>Cross-Site Scripting (XSS):</b> tricking a legit site into running an attacker's script (often in comments/reviews). Common outcome: redirect to a phishing site. <b>Pharming</b> = redirection via technical means (DNS poisoning). Forensics: search for malicious scripts; more efficient — check web server logs for HTTP 300-range redirects.</p>`,
      },
      {
        h: 'Ophcrack & privilege escalation',
        body: `
<p><b>Ophcrack:</b> cracks local Windows passwords; boots from CD/USB (needs <b>physical access</b>, ~10 min). Windows stores passwords as <b>hashes in the SAM file</b>. Ophcrack doesn't unhash (hashing is one-way) — it matches against <b>rainbow tables</b> (precomputed NTLM hashes), effective for simple 8-10 char passwords.</p>
<p><b>Forensic signature:</b> unexpected reboot + successful login by a rarely-used account. Since reboots may wipe logs, rely on <b>physical evidence</b> — cameras, door logs, fingerprints.</p>
<p><b>Tricking tech support</b> (post-Ophcrack): a two-line <code>net user</code> / <code>net group</code> script placed in the All Users startup folder adds the local account to Domain Admins when an admin next logs in. Forensics: hunt startup scripts, examine compromised account + admin activity, check physical security.</p>`,
      },
      {
        h: 'Cyberstalking & harassment',
        body: `
<p>Using electronic communications to stalk. Generally requires repeated harassing/threatening behavior, often with a credible/implied/direct threat.</p>
<p><b>Three criteria:</b> (1) <b>Is it possible?</b> — credibility of the threat; (2) <b>How frequent?</b> — repeated by definition; (3) <b>How serious?</b> — specific, premeditated threats vs. vague emotion. Not all three required, but all considered.</p>
<p><b>Forensics:</b> computer as a tool; stalkers often not tech-savvy, so tracing emails/texts is a good start. Examine suspect devices — obsessive behavior means retained evidence.</p>`,
      },
      {
        h: 'Fraud',
        body: `
<p>Any attempt to gain financial reward through deception.</p>
<ul>
<li><b>Investment offers</b> — pump-and-dump (inflate a stock via false rumors, then sell), Nigerian Prince / 419 scams. Forensics: trace communications/emails, domain registration.</li>
<li><b>Data piracy</b> — illegal distribution of IP (music, software on "warez" sites). Forensics: trace website owners, WHOIS the domain registrant.</li>
</ul>`,
      },
      {
        h: 'Non-access crimes: DoS, viruses, logic bombs',
        body: `
<p><b>Denial of Service (DoS):</b> prevent legitimate access, usually by overwhelming a target. <b>SYN flood</b> exploits the TCP three-way handshake (SYN → SYN-ACK → ACK) by never sending the final ACK — half-open connections exhaust resources. Tools: Low Orbit Ion Cannon, TFN/TFN2K (→ DDoS botnet), Trin00, Smurf (spoofed ICMP to broadcast), Fraggle (UDP), DHCP starvation, HTTP POST, PDoS/phlashing (firmware), TDoS (phone systems).</p>
<p><b>DoS forensics:</b> single-machine — trace packets to source; attackers spoof IP but <b>less commonly the MAC</b> → un-spoofed MAC = origin. DDoS — trace to infected machines, then find <b>commonalities</b> (shared downloads/sites) to locate the botnet source.</p>
<p><b>Viruses:</b> self-replicating malware. Examples: FakeAV.86, Flame, Gameover Zeus, WannaCry, Emotet, Ryuk, Rombertik, Locky. Types: macro, memory-resident, multi-partite, armored, sparse infector, polymorphic/metamorphic. Forensics: document behavior, find commonalities, use published research.</p>
<p><b>Logic bombs:</b> malware triggered by a logical condition (date/time). Often planted by employees (David Tinley/Siemens, Roger Duronio/UBS). Forensics: usually points to someone with access + programming skill; motive is key.</p>`,
      },
      {
        h: 'Cyberterrorism',
        body: `
<p>A serious, growing threat (North Korea/China activity, defense-plan theft, ISIS/Ardit Ferizi, power-grid attacks, China Eagle Union). Technically mirrors other cybercrime investigations — the difference is <b>jurisdiction</b>, typically the FBI.</p>`,
      },
    ],
  },

  {
    id: 'ch3',
    num: 3,
    title: 'Methodology, Lab & Tools',
    subtitle: 'Frameworks, forensic lab setup, software & certifications',
    relatedCases: ['case4'],
    sections: [
      {
        h: 'Core principles of forensic investigation',
        body: `
<ul>
<li><b>Preserve original evidence</b> — handle originals as little as possible; work from a bit-level image. <b>Locard's Principle of Transference:</b> any interaction leaves a trace. Make two copies (one to analyze, one backup).</li>
<li><b>Adhere to legal rules</b> — comply with the jurisdiction's rules of evidence; know how to authenticate evidence, qualify as an expert, and present admissibly.</li>
<li><b>Maintain objectivity & expertise</b> — create a formal analysis plan; operate strictly within your knowledge. Overstating expertise destroys credibility.</li>
</ul>`,
      },
      {
        h: 'Formal forensic frameworks',
        body: `
<ul>
<li><b>DFRWS</b> — six stages: Identification, Preservation, Collection, Examination, Analysis, Presentation.</li>
<li><b>SWGDE</b> — four stages: Collect, Preserve, Examine, Transfer.</li>
<li><b>Event-Based</b> — five phases: Readiness, Deployment, Physical + Digital Crime Scene Investigation, Presentation.</li>
</ul>`,
      },
      {
        h: 'The forensic lab',
        body: `
<ul>
<li><b>Equipment:</b> adequate, redundant storage (RAID 5 recommended), variety of computers, connectors for all drive/device types.</li>
<li><b>Security:</b> network isolation, physical security (logged, restricted access), evidence security (fire-resistant safes), electromagnetic shielding (TEMPEST).</li>
<li><b>Standards:</b> ISO/IEC 27037; accreditation from ASCLD.</li>
</ul>`,
      },
      {
        h: 'Forensic software',
        body: `
<p>Use multiple tools to validate results.</p>
<ul>
<li><b>Commercial:</b> EnCase, Forensic Toolkit (FTK), OSForensics.</li>
<li><b>Open-source / free:</b> The Sleuth Kit & Autopsy, Kali Linux, Disk Investigator.</li>
<li><b>Specialized:</b> Helix (Live CD), CopyQM Plus (disk duplicator), AnaDisk (anomaly scanner).</li>
</ul>`,
      },
      {
        h: 'Evidence handling, analysis & reporting',
        body: `
<p>Core tasks: <b>Find, Preserve, Prepare</b> evidence for judicial scrutiny. Collect by <b>order of volatility</b> and at the <b>bit level</b> (captures file slack). Document every step; maintain chain of custody. The expert report must be thorough — all tests, findings, conclusions, credible sources, and full CV.</p>`,
      },
      {
        h: 'Certifications',
        body: `
<p><b>Foundational:</b> PC hardware (CompTIA A+), networking (Network+, CCNA), security (Security+, CISSP), hacking (CEH, GPEN).</p>
<p><b>Vendor-specific:</b> EnCE (EnCase), ACE (AccessData), OSForensics.</p>
<p><b>General forensic:</b> CHFI (EC-Council), GIAC (GCFA, GCFE).</p>`,
      },
    ],
  },

  {
    id: 'ch4',
    num: 4,
    title: 'Seizure, Storage & Imaging',
    subtitle: 'Handling a suspect machine, hidden data, forensic imaging & RAID',
    relatedCases: ['case1', 'case4'],
    sections: [
      {
        h: 'Handling a suspect computer',
        body: `
<p><b>1. Don't immediately shut down.</b> Valuable evidence lives in volatile <b>RAM</b>. Before powering down: check running processes/connections (<code>netstat</code>, <code>net sessions</code>, <code>openfiles</code>); perform a memory capture/dump (OSForensics, FTK). When shutting down, often better to <b>pull the plug</b> than a normal shutdown (which can alter/delete temp files).</p>
<p><b>2. Maintain a strict chain of custody.</b> Photograph and document everything before touching (cables, peripherals, BIOS/UEFI time). Transport directly to a secure lab — any unaccounted period breaks the chain and can render evidence inadmissible. Each item needs its own chain-of-custody form.</p>
<p><b>3. Ensure integrity with hashing.</b> Create a bit-for-bit forensic image; secure the original. Generate a hash (MD5 or SHA2) of both original and copy. Matching hashes = mathematical proof the copy is exact and unaltered.</p>`,
      },
      {
        h: 'The hunt for digital evidence',
        body: `
<p>Find, preserve, prepare. Look beyond obvious files:</p>
<ul>
<li><b>Volatile data</b> — first priority; running processes + active connections.</li>
<li><b>Swap file (pagefile.sys)</b> — virtual RAM; fragments of documents, passwords, history; persists after reboot.</li>
<li><b>Unallocated space</b> — deleted data remains until overwritten; often recoverable.</li>
<li><b>File metadata</b> — creation/modification times (timelines); Exif in images (camera, date/time, GPS).</li>
</ul>
<p><b>Build a timeline</b> from timestamps/metadata across files, logs, devices — turns isolated data into a coherent narrative. <b>Present clearly</b> in plain English for a non-technical judge/jury.</p>`,
      },
      {
        h: 'Storage media & hidden data',
        body: `
<p><b>Media (always image, never work the original):</b> Magnetic HDDs (shock/magnetic-field vulnerable; anti-static bags), SSDs (flash, faster, damage-resistant), Optical (scratch-vulnerable), Tape (restore to a wiped drive first), USB (access read-only / hardware write-blocker).</p>
<p><b>Hidden data:</b> <b>Host Protected Area (HPA)</b> — manufacturer-reserved hidden section; <b>Slack space</b> — File slack (between file end and cluster end) and Volume slack (outside any partition); <b>"Bad" blocks</b> — healthy blocks marked bad so the OS ignores them, used to hide data.</p>
<p><b>Forensic file formats:</b> AFF (open-source, Autopsy), EnCase format (proprietary, includes a verifying hash), Gfzip (open-source).</p>`,
      },
      {
        h: 'Forensic imaging',
        body: `
<p>Create a forensically sound, bit-for-bit copy; never work the original.</p>
<p><b>Two prep steps:</b> (1) connect the original via a hardware <b>write blocker</b> (prevents any change); (2) forensically <b>wipe the destination</b> (overwrite every bit so no old data contaminates).</p>
<p><b>Methods:</b> Manual — Linux <code>dd</code> (low-level bit-for-bit copy) piped through <code>netcat</code> to a server. Automated — FTK Imager / EnCase: Create Disk Image → choose <b>Physical Drive</b> (includes deleted files + unallocated space) → source + wiped destination.</p>
<p><b>Verification is the most critical step:</b> tools hash the original and the image; matching hashes prove a perfect, unaltered duplicate. OSForensics checks "verify image" by default — do not uncheck it.</p>`,
      },
      {
        h: 'Acquiring RAID',
        body: `
<p><b>RAID</b> combines multiple physical drives into one logical unit for performance or redundancy.</p>
<ul>
<li><b>RAID 0 (striping)</b> — data split across disks; fast, no redundancy.</li>
<li><b>RAID 1 (mirroring)</b> — identical copy on each disk; full redundancy.</li>
<li><b>RAID 5 (striping with parity)</b> — striped + distributed parity; can rebuild if any single drive fails.</li>
</ul>
<p><b>Parity via XOR:</b> XOR the data drives to compute parity; if a drive fails, XOR the survivors + parity to reconstruct the lost data.</p>
<p><b>Golden rule:</b> RAID 1 — may image each drive separately (identical). Any <b>striping</b> (RAID 0/5) — <b>do not</b> image drives individually (each holds only a fraction); image the entire array as a single logical volume. FTK, EnCase, OSForensics handle this.</p>`,
      },
    ],
  },
];

if (typeof window !== 'undefined') window.NOTES = NOTES;
