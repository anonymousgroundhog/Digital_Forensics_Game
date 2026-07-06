// Case data for Digital Forensics Detective.
// Each chapter is split into an EASY and an ADVANCED case so that together the
// cases cover EVERY section of the chapter notes (notes.js). Every stage has
// choices carrying points + an explanation tied to the source chapter.

const CASES = [
  // ======================================================================
  // CHAPTER 1a — Fundamentals (concepts, evidence, legal)
  {
    id: 'case1a',
    title: 'First Principles',
    crime: 'Ch 1 · Fundamentals & Law',
    chapter: 1, tier: 'Core',
    chapters: 'Ch 1',
    difficulty: 'Rookie',
    world: 'phishing', accent: '#3ddc84', scene: 'Data Stream', icon: '📖',
    brief:
      "Before you touch a drive, master the fundamentals. What forensics is, how the process works, what evidence counts, and the laws and standards that keep it admissible. A defense attorney is waiting for any misstep.",
    stages: [
      { prompt: "How is 'computer forensics' best defined?", choices: [
        { text: "Analytical/investigative techniques to identify, collect, examine, and preserve computer-based material as evidence in court", points: 20, correct: true,
          explain: "Correct. Forensics centers on court-admissible evidence with integrity — not just recovering data (Ch 1)." },
        { text: "Any method of recovering deleted files", points: 0, correct: false,
          explain: "Data recovery is one slice. Forensics is about legally admissible evidence with chain of custody (Ch 1)." },
        { text: "Hacking systems to test security", points: 0, correct: false,
          explain: "That's pen testing. Forensics investigates and preserves evidence for court (Ch 1)." } ] },
      { prompt: "What are the three stages of the forensic process, in order?", choices: [
        { text: "Collecting → Analyzing → Presenting", points: 20, correct: true,
          explain: "Correct. Collect properly, analyze like a puzzle, present in plain English via report/testimony (Ch 1)." },
        { text: "Imaging → Encrypting → Archiving", points: 0, correct: false,
          explain: "Those are tasks, not the model. It's Collect, Analyze, Present (Ch 1)." },
        { text: "Hacking → Reporting → Testifying", points: 0, correct: false,
          explain: "Not the model. The three stages are Collecting, Analyzing, Presenting (Ch 1)." } ] },
      { prompt: "Which are the four types of evidence courts consider?", choices: [
        { text: "Real, documentary, testimonial, and demonstrative", points: 20, correct: true,
          explain: "Correct. Real (physical), documentary (stored info), testimonial (expert), demonstrative (explanatory visuals) (Ch 1)." },
        { text: "Digital, analog, physical, and virtual", points: 0, correct: false,
          explain: "Not the classification. It's real, documentary, testimonial, demonstrative (Ch 1)." },
        { text: "Primary, secondary, hearsay, and circumstantial", points: 0, correct: false,
          explain: "Those are general legal terms, not the four forensic types (Ch 1)." } ] },
      { prompt: "An expert wants to testify about a finding NOT in their written report. Allowed?", choices: [
        { text: "No — experts can only testify about matters included in their report", points: 20, correct: true,
          explain: "Correct. Testimony is limited to the report's contents, so reports must be exhaustive (Ch 1)." },
        { text: "Yes — experts may testify about anything in their expertise", points: 0, correct: false,
          explain: "Wrong. If it's not in the report, it can't be testified to (Ch 1)." },
        { text: "Only if opposing counsel agrees", points: 0, correct: false,
          explain: "No such exception. The report defines the scope of testimony (Ch 1)." } ] },
      { prompt: "Which is the MOST vital principle for admissible evidence?", choices: [
        { text: "An unbroken, documented chain of custody", points: 20, correct: true,
          explain: "Correct. Continuous control from collection to court is most vital; a break can exclude evidence (Ch 1)." },
        { text: "Using the most expensive commercial tool", points: 0, correct: false,
          explain: "Tool cost is irrelevant. Continuous documented control is what matters (Ch 1)." },
        { text: "Finishing as fast as possible", points: 0, correct: false,
          explain: "Speed never trumps integrity. Chain of custody is paramount (Ch 1)." } ] },
      { prompt: "Which legal standard governs whether your scientific methods are admissible?", choices: [
        { text: "The Daubert standard — widely accepted, testable, peer-reviewed methods", points: 20, correct: true,
          explain: "Correct. Daubert weighs testability, peer review, error rates, standards, general acceptance (Ch 1)." },
        { text: "The Miranda standard", points: 0, correct: false,
          explain: "Miranda covers interrogation rights, not scientific evidence. You want Daubert (Ch 1)." },
        { text: "The Turing standard", points: 0, correct: false,
          explain: "Not a legal standard. Scientific admissibility is Daubert (Ch 1)." } ] },
      { prompt: "Under the 4th Amendment, when is a warrant generally NOT required to search a computer?", choices: [
        { text: "When evidence is in plain sight, or valid consent is given by the proper party", points: 20, correct: true,
          explain: "Correct. Plain view and proper consent are exceptions; also border crossings and imminent evidence destruction (Ch 1)." },
        { text: "Whenever the investigator believes a crime occurred", points: 0, correct: false,
          explain: "Belief alone isn't enough. Exceptions are plain view, consent, borders, imminent destruction (Ch 1)." },
        { text: "Never — a warrant is always required", points: 3, correct: false,
          explain: "Warrants are usually required, but plain view and consent are recognized exceptions (Ch 1)." } ] },
      { prompt: "Which US law prohibits intentional unauthorized access to stored electronic communications?", choices: [
        { text: "Unlawful Access to Stored Communications (18 U.S.C. § 2701)", points: 20, correct: true,
          explain: "Correct. §2701 is broader than the CFAA and applies e.g. to employees taking company data on departure (Ch 1)." },
        { text: "The Digital Millennium Copyright Act (DMCA)", points: 0, correct: false,
          explain: "The DMCA targets circumventing copyright protection. Stored-comms access is §2701 (Ch 1)." },
        { text: "COPPA", points: 0, correct: false,
          explain: "COPPA protects children's online privacy. Stored-comms access is §2701 (Ch 1)." } ] },
      { prompt: "Per Secret Service 'golden rules', if the suspect computer is OFF when you arrive, you should:", choices: [
        { text: "Leave it off — do not power it on", points: 20, correct: true,
          explain: "Correct. If it's off, leave it off; if on, properly handle/transport rather than searching it (Ch 1 federal guidelines)." },
        { text: "Boot it to check for evidence before seizing", points: 0, correct: false,
          explain: "Booting alters the system. If off, leave it off (Ch 1)." },
        { text: "Reformat it to preserve a clean copy", points: 0, correct: false,
          explain: "Never destroy data. If off, leave it off and seize properly (Ch 1)." } ] },
    ],
  },

  // ======================================================================
  // CHAPTER 1b — Technical (hardware, file systems, networks, anti-forensics)
  {
    id: 'case1b',
    title: 'Under the Hood',
    crime: 'Ch 1 · Hardware, File Systems & Networks',
    chapter: 1, tier: 'Advanced',
    chapters: 'Ch 1',
    difficulty: 'Investigator',
    world: 'phishing', accent: '#2fd6b0', scene: 'Data Stream', icon: '🔧',
    brief:
      "A forensic analyst must know the machine cold — memory volatility, drive structure, file systems, network addressing, and the tricks criminals use to hide data. Prove your technical foundation.",
    stages: [
      { prompt: "Which memory type is HIGHLY volatile (lost at power-off)?", choices: [
        { text: "RAM", points: 20, correct: true,
          explain: "Correct. RAM is highly volatile; ROM/PROM/EPROM/EEPROM retain data without power (Ch 1)." },
        { text: "EEPROM", points: 3, correct: false,
          explain: "EEPROM is very nonvolatile — it stores the BIOS. RAM is the volatile one (Ch 1)." },
        { text: "ROM", points: 0, correct: false,
          explain: "ROM is permanent/nonvolatile. RAM is volatile (Ch 1)." } ] },
      { prompt: "Where are a computer's BIOS instructions stored?", choices: [
        { text: "EEPROM (electrically erasable programmable ROM)", points: 20, correct: true,
          explain: "Correct. EEPROM retains data without power and can be electrically reprogrammed — how BIOS is stored (Ch 1)." },
        { text: "RAM", points: 0, correct: false,
          explain: "RAM is volatile and can't hold BIOS at power-off. BIOS lives in EEPROM (Ch 1)." },
        { text: "The hard drive's slack space", points: 0, correct: false,
          explain: "Slack space is unused file space, not firmware storage. BIOS is in EEPROM (Ch 1)." } ] },
      { prompt: "What is 'slack space' and why does it matter forensically?", choices: [
        { text: "Unused space at the end of a file's cluster that can hide data", points: 20, correct: true,
          explain: "Correct. File slack can conceal data; on SSDs wear leveling makes it less useful for hiding (Ch 1)." },
        { text: "The gap between the CPU and RAM", points: 0, correct: false,
          explain: "Not hardware spacing. Slack space is leftover space in a cluster (Ch 1)." },
        { text: "Free RAM available to programs", points: 0, correct: false,
          explain: "That's memory headroom. Slack space is on-disk leftover cluster space (Ch 1)." } ] },
      { prompt: "Which is the most common drive interface in modern workstations/servers?", choices: [
        { text: "SATA (Serial ATA)", points: 20, correct: true,
          explain: "Correct. SATA is most common today; older ones include SCSI, IDE/EIDE/PATA (Ch 1)." },
        { text: "SCSI from 1986", points: 3, correct: false,
          explain: "SCSI is older, mainly high-end servers, needs termination. SATA is the common modern interface (Ch 1)." },
        { text: "Floppy controller", points: 0, correct: false,
          explain: "Obsolete. SATA is the common modern interface (Ch 1)." } ] },
      { prompt: "What makes a JOURNALING file system fault-tolerant?", choices: [
        { text: "It keeps a log (journal) of file transactions, enabling recovery after a crash", points: 20, correct: true,
          explain: "Correct. Physical journaling logs blocks (with checksums); logical journaling logs metadata changes (Ch 1)." },
        { text: "It encrypts every file automatically", points: 0, correct: false,
          explain: "Encryption isn't journaling. A journal logs transactions for recovery (Ch 1)." },
        { text: "It duplicates the drive in real time", points: 0, correct: false,
          explain: "That's mirroring/RAID. Journaling logs file transactions (Ch 1)." } ] },
      { prompt: "Which file system did Microsoft introduce in 1993 to replace FAT?", choices: [
        { text: "NTFS", points: 20, correct: true,
          explain: "Correct. NTFS (1993) supports much larger volumes than FAT; later came ReFS. Apple uses APFS, Linux EXT4 (Ch 1)." },
        { text: "APFS", points: 0, correct: false,
          explain: "APFS is Apple's (2017). Microsoft's FAT replacement is NTFS (Ch 1)." },
        { text: "EXT4", points: 0, correct: false,
          explain: "EXT4 is Linux's. Microsoft's FAT replacement is NTFS (Ch 1)." } ] },
      { prompt: "A MAC address is best described as:", choices: [
        { text: "A unique 6-byte (48-bit) physical address on a network card; first 3 bytes identify the vendor", points: 20, correct: true,
          explain: "Correct. MACs can be duplicated intentionally or by poor QC — a sharp investigator won't be fooled (Ch 1)." },
        { text: "A 32-bit logical address that's easily changed", points: 3, correct: false,
          explain: "That describes an IPv4 address. A MAC is a 48-bit physical address (Ch 1)." },
        { text: "The website name typed into a browser", points: 0, correct: false,
          explain: "That's a URL/DNS name. A MAC is a physical hardware address (Ch 1)." } ] },
      { prompt: "Which technique HIDES data by making it unreadable rather than by wiping it?", choices: [
        { text: "Data transformation — e.g. encryption or steganography", points: 20, correct: true,
          explain: "Correct. Obscured info uses encryption, steganography, compression, or proprietary formats to evade examination (Ch 1)." },
        { text: "Data destruction — overwriting or damaging the drive", points: 3, correct: false,
          explain: "That destroys data. Making data unreadable is transformation (encryption/steganography) (Ch 1)." },
        { text: "Defragmentation", points: 0, correct: false,
          explain: "Defrag reorganizes files; it isn't anti-forensics. Hiding-by-unreadable is transformation (Ch 1)." } ] },
    ],
  },

  // ======================================================================
  // CHAPTER 2a — Computer Crime I (theft, hacking)
  {
    id: 'case2a',
    title: 'Know Your Enemy',
    crime: 'Ch 2 · Identity Theft & Hacking',
    chapter: 2, tier: 'Core',
    chapters: 'Ch 2',
    difficulty: 'Rookie',
    world: 'server', accent: '#35c9e8', scene: 'Server Room', icon: '🦠',
    brief:
      "Different crimes leave different evidence. Tonight: phishing, spyware, SQL injection, XSS, and an Ophcrack break-in. Identify each attack — the forensic strategy depends on knowing the enemy.",
    stages: [
      { prompt: "In a crime, a computer can play which roles?", choices: [
        { text: "Target of the crime, instrument used to commit it, or an evidence repository", points: 20, correct: true,
          explain: "Correct. Knowing the role tailors the search (password crackers for instrument, audit logs for target) (Ch 2)." },
        { text: "Only ever the target", points: 0, correct: false,
          explain: "It can be target, instrument, OR evidence repository — often several at once (Ch 2)." },
        { text: "Only a passive witness", points: 0, correct: false,
          explain: "Computers actively serve as target, instrument, or repository (Ch 2)." } ] },
      { prompt: "A victim clicked a link in an email posing as her bank and lost money. What crime?", choices: [
        { text: "Phishing", points: 20, correct: true,
          explain: "Correct. Phishing uses fake emails/sites via social engineering; spear phishing targets specific high-value people (Ch 2)." },
        { text: "A SYN flood", points: 0, correct: false,
          explain: "A SYN flood is DoS, not email credential theft. This is phishing (Ch 2)." },
        { text: "A logic bomb", points: 0, correct: false,
          explain: "Logic bombs trigger on a condition, usually insider-planted. This is phishing (Ch 2)." } ] },
      { prompt: "What is spyware, and can it ever be legal?", choices: [
        { text: "Software that monitors activity (keystrokes/screenshots); legal in limited cases like parents on minors or employers on company equipment", points: 20, correct: true,
          explain: "Correct. ~80% of connected computers are believed infected; legal uses exist (Teen Safe, WorkTime) (Ch 2)." },
        { text: "Always illegal, no exceptions", points: 3, correct: false,
          explain: "It can be legal — parents on minors, employers on company systems, or with a warrant (Ch 2)." },
        { text: "A type of firewall", points: 0, correct: false,
          explain: "No — spyware monitors activity covertly; it isn't a firewall (Ch 2)." } ] },
      { prompt: "A login form is bypassed by entering ' OR 1=1 -- . What attack?", choices: [
        { text: "SQL Injection", points: 20, correct: true,
          explain: "Correct. Unvalidated input concatenated into a query makes the WHERE clause always true (Ch 2)." },
        { text: "Cross-site scripting (XSS)", points: 3, correct: false,
          explain: "XSS injects scripts into pages. The ' OR 1=1 -- payload hits the database — that's SQLi (Ch 2)." },
        { text: "A Smurf attack", points: 0, correct: false,
          explain: "Smurf is DoS via spoofed ICMP. This is SQL injection (Ch 2)." } ] },
      { prompt: "An attacker injects JavaScript into a site's comment field that runs in other users' browsers. When redirection is done via DNS poisoning it's called…", choices: [
        { text: "Cross-site scripting (XSS); the DNS-poisoning redirect is pharming", points: 20, correct: true,
          explain: "Correct. XSS delivers malicious scripts; technical redirection (DNS poisoning) to a fake site is pharming (Ch 2)." },
        { text: "SQL injection; the redirect is phishing", points: 3, correct: false,
          explain: "Script injection into pages is XSS, and technical redirection is pharming (not social-engineering phishing) (Ch 2)." },
        { text: "A logic bomb; the redirect is spoofing", points: 0, correct: false,
          explain: "Script-in-page = XSS; DNS-poison redirect = pharming (Ch 2)." } ] },
      { prompt: "For investigating XSS efficiently, what's a good forensic method?", choices: [
        { text: "Examine web server logs for HTTP 300-range redirect messages", points: 20, correct: true,
          explain: "Correct. Rather than hunting scripts on a large site, check server logs for illegitimate 300-range redirects (Ch 2)." },
        { text: "Reformat the web server", points: 0, correct: false,
          explain: "That destroys evidence. Inspect server logs for redirects (Ch 2)." },
        { text: "Check the BIOS chip", points: 0, correct: false,
          explain: "Irrelevant to XSS. Examine web server redirect logs (Ch 2)." } ] },
      { prompt: "A 2 AM reboot then a rarely-used admin login, clean firewall logs. Likely cause?", choices: [
        { text: "An Ophcrack physical-access attack (rainbow tables vs. SAM hashes)", points: 20, correct: true,
          explain: "Correct. Reboot + rare admin login + clean network logs = Ophcrack; it needs physical access (Ch 2)." },
        { text: "A remote pump-and-dump scheme", points: 0, correct: false,
          explain: "Pump-and-dump is investment fraud. This signature is Ophcrack (Ch 2)." },
        { text: "A macro virus", points: 0, correct: false,
          explain: "Macro viruses live in documents. Reboot + physical-access = Ophcrack (Ch 2)." } ] },
      { prompt: "Since Ophcrack's reboot may wipe logs, where's the strongest evidence?", choices: [
        { text: "Physical evidence — camera footage, door logs, fingerprints", points: 20, correct: true,
          explain: "Correct. The attack needs physical access, so physical evidence is crucial (Ch 2)." },
        { text: "Inbound firewall traffic logs", points: 0, correct: false,
          explain: "They're already clean — it was physical, not network (Ch 2)." },
        { text: "The website's SQL logs", points: 0, correct: false,
          explain: "Irrelevant to a physical Ophcrack attack. Use physical evidence (Ch 2)." } ] },
    ],
  },

  // ======================================================================
  // CHAPTER 2b — Computer Crime II (stalking, fraud, non-access, terrorism)
  {
    id: 'case2b',
    title: 'The Wider War',
    crime: 'Ch 2 · Stalking, Fraud, DoS & Cyberterror',
    chapter: 2, tier: 'Advanced',
    chapters: 'Ch 2',
    difficulty: 'Investigator',
    world: 'server', accent: '#1fb6d6', scene: 'Server Room', icon: '⚔️',
    brief:
      "Beyond hacking lies a wider war: cyberstalking, online fraud, denial-of-service, viruses, logic bombs, and cyberterrorism. Match each to its forensic approach and jurisdiction.",
    stages: [
      { prompt: "Which three criteria help decide if online behavior is cyberstalking?", choices: [
        { text: "Is it possible? How frequent? How serious?", points: 20, correct: true,
          explain: "Correct. Credibility, repetition (stalking is 'repeated'), and seriousness/premeditation — all considered, not all required (Ch 2)." },
        { text: "Is it funny? Is it public? Is it anonymous?", points: 0, correct: false,
          explain: "Not the criteria. It's possible / frequent / serious (Ch 2)." },
        { text: "Who? What? When?", points: 0, correct: false,
          explain: "Generic. The three criteria are possible, frequent, serious (Ch 2)." } ] },
      { prompt: "Why are cyberstalking suspects' own devices a good place to look?", choices: [
        { text: "Stalkers are often not tech-savvy and their obsessive behavior means retained digital evidence", points: 20, correct: true,
          explain: "Correct. Tracing emails/texts is a good start, and obsessive behavior leaves retained evidence (Ch 2)." },
        { text: "Because devices auto-report crimes to police", points: 0, correct: false,
          explain: "They don't. It's the retained evidence from obsessive behavior that helps (Ch 2)." },
        { text: "Because stalkers always encrypt everything", points: 0, correct: false,
          explain: "Often the opposite — not tech-savvy, evidence retained (Ch 2)." } ] },
      { prompt: "A scheme inflates a stock with false rumors, then sells at the peak. What fraud is this?", choices: [
        { text: "A pump-and-dump scheme", points: 20, correct: true,
          explain: "Correct. The internet (fake blogs/boards/emails) spreads misinformation to millions; trace the communications (Ch 2)." },
        { text: "A Nigerian Prince (419) scam", points: 3, correct: false,
          explain: "419 scams promise a payout for an upfront fee. Inflate-then-sell a stock is pump-and-dump (Ch 2)." },
        { text: "Data piracy", points: 0, correct: false,
          explain: "Data piracy is illegal IP distribution. Inflate-then-sell is pump-and-dump (Ch 2)." } ] },
      { prompt: "First forensic step for a website distributing pirated software?", choices: [
        { text: "Identify the domain registrant via a WHOIS search", points: 20, correct: true,
          explain: "Correct. Trace ownership through WHOIS; clever perpetrators use multiple identities, but the site is the starting point (Ch 2)." },
        { text: "Immediately shut down the internet", points: 0, correct: false,
          explain: "Not feasible or lawful. Start by WHOIS-tracing the domain registrant (Ch 2)." },
        { text: "Assume it's untraceable", points: 0, correct: false,
          explain: "Trace the domain registrant with WHOIS (Ch 2)." } ] },
      { prompt: "A SYN flood exhausts a server by exploiting what?", choices: [
        { text: "The TCP three-way handshake — sending SYNs but never the final ACK, leaving half-open connections", points: 20, correct: true,
          explain: "Correct. Half-open connections exhaust resources. Other DoS: Smurf, Fraggle, TDoS, PDoS/phlashing (Ch 2)." },
        { text: "The DNS name-to-IP cache", points: 0, correct: false,
          explain: "That's pharming/DNS issues. SYN flood abuses the TCP handshake (Ch 2)." },
        { text: "The BIOS boot order", points: 0, correct: false,
          explain: "Unrelated. SYN flood abuses the TCP handshake (Ch 2)." } ] },
      { prompt: "For a single-machine DoS with a spoofed IP, what's the investigator's break?", choices: [
        { text: "Attackers less commonly spoof the MAC address — an un-spoofed MAC points to the origin", points: 20, correct: true,
          explain: "Correct. IP spoofing is common; MAC spoofing less so, giving direct origin evidence (Ch 2)." },
        { text: "The attacker emails a confession", points: 0, correct: false,
          explain: "No. The realistic break is an un-spoofed MAC address (Ch 2)." },
        { text: "The packets contain the attacker's home address", points: 0, correct: false,
          explain: "Not literally. Look for an un-spoofed MAC (Ch 2)." } ] },
      { prompt: "Which is a recognized VIRUS category?", choices: [
        { text: "Polymorphic (changes form to evade AV; metamorphic rewrites itself)", points: 20, correct: true,
          explain: "Correct. Also: macro, memory-resident, multi-partite, armored, sparse infector (Ch 2)." },
        { text: "Journaling virus", points: 0, correct: false,
          explain: "Journaling is a file-system feature, not a virus type. Polymorphic is a real category (Ch 2)." },
        { text: "RAID virus", points: 0, correct: false,
          explain: "Not a virus category. Polymorphic/metamorphic are (Ch 2)." } ] },
      { prompt: "A disgruntled employee plants code that damages the system on a set date. What is it?", choices: [
        { text: "A logic bomb — condition-triggered, often insider-planted; motive is a key clue", points: 20, correct: true,
          explain: "Correct. Points to someone with access + programming skill (Tinley/Siemens, Duronio/UBS) (Ch 2)." },
        { text: "A DDoS", points: 0, correct: false,
          explain: "DDoS floods a service. Date-triggered insider damage is a logic bomb (Ch 2)." },
        { text: "Phishing", points: 0, correct: false,
          explain: "Phishing steals credentials via email. This is a logic bomb (Ch 2)." } ] },
      { prompt: "Investigating cyberterrorism technically mirrors other cybercrime — what's the KEY difference?", choices: [
        { text: "Jurisdiction — such cases typically fall under the FBI", points: 20, correct: true,
          explain: "Correct. The technical work (virus/DoS analysis) is similar; jurisdiction (FBI) is the differentiator (Ch 2)." },
        { text: "You must ignore chain of custody", points: 0, correct: false,
          explain: "Never. Chain of custody always applies; the difference is jurisdiction (Ch 2)." },
        { text: "Physical evidence is irrelevant", points: 0, correct: false,
          explain: "Not so. The real difference is jurisdiction — usually the FBI (Ch 2)." } ] },
    ],
  },

  // ======================================================================
  // CHAPTER 3 — Methodology, Lab & Tools
  {
    id: 'case3',
    title: 'By The Book',
    crime: 'Ch 3 · Methodology, Lab & Tools',
    chapter: 3, tier: 'Core',
    chapters: 'Ch 3',
    difficulty: 'Investigator',
    world: 'ddos', accent: '#ff5470', scene: 'The Lab', icon: '🧪',
    brief:
      "Set up and run a forensics lab to a professional standard: right principles, right frameworks, secure facility, validated tools, and the certifications that back your expertise. Do it by the book.",
    stages: [
      { prompt: "Which principle justifies working from a bit-level image (any interaction leaves a trace)?", choices: [
        { text: "Locard's Principle of Transference", points: 20, correct: true,
          explain: "Correct. It underpins 'preserve the original' — handle originals minimally, work from an image (Ch 3)." },
        { text: "Moore's Law", points: 0, correct: false,
          explain: "Moore's Law is transistor density. The trace-on-contact idea is Locard's (Ch 3)." },
        { text: "Kirchhoff's Law", points: 0, correct: false,
          explain: "Electrical law. The forensic one is Locard's Principle (Ch 3)." } ] },
      { prompt: "How many copies of the evidence image is standard practice?", choices: [
        { text: "Two — one to analyze, one as backup", points: 20, correct: true,
          explain: "Correct. Two bit-level copies: analysis + preserved backup (Ch 3)." },
        { text: "None — analyze the original", points: 0, correct: false,
          explain: "Never work the original. Make copies (Ch 3)." },
        { text: "Ten, scattered around the lab", points: 0, correct: false,
          explain: "Overkill. The standard is two copies (Ch 3)." } ] },
      { prompt: "Which is a recognized formal forensic framework?", choices: [
        { text: "DFRWS — Identification, Preservation, Collection, Examination, Analysis, Presentation", points: 20, correct: true,
          explain: "Correct. Others: SWGDE (Collect, Preserve, Examine, Transfer) and the Event-Based framework (Ch 3)." },
        { text: "OWASP Top 10", points: 0, correct: false,
          explain: "A web-app security list, not a forensic process model. DFRWS/SWGDE are (Ch 3)." },
        { text: "The OSI model", points: 0, correct: false,
          explain: "A networking model. Forensic frameworks are DFRWS, SWGDE, Event-Based (Ch 3)." } ] },
      { prompt: "The SWGDE framework's four stages are:", choices: [
        { text: "Collect, Preserve, Examine, Transfer", points: 20, correct: true,
          explain: "Correct. SWGDE is a four-stage process; DFRWS has six; Event-Based has five phases (Ch 3)." },
        { text: "Plan, Do, Check, Act", points: 0, correct: false,
          explain: "That's a generic quality cycle. SWGDE = Collect, Preserve, Examine, Transfer (Ch 3)." },
        { text: "Seize, Hash, Report, Destroy", points: 0, correct: false,
          explain: "No — and never 'destroy'. SWGDE = Collect, Preserve, Examine, Transfer (Ch 3)." } ] },
      { prompt: "For a forensic lab, what's recommended for redundant storage?", choices: [
        { text: "RAID 5", points: 20, correct: true,
          explain: "Correct. Labs need redundant storage (RAID 5), varied computers, connectors for all drive types (Ch 3)." },
        { text: "A single consumer USB stick", points: 0, correct: false,
          explain: "No redundancy. RAID 5 is recommended (Ch 3)." },
        { text: "Cloud only, no local backup", points: 0, correct: false,
          explain: "Not the standard. RAID 5 redundancy is recommended (Ch 3)." } ] },
      { prompt: "Which describes proper lab SECURITY practice?", choices: [
        { text: "Network isolation, logged/restricted physical access, fire-resistant safes, TEMPEST shielding", points: 20, correct: true,
          explain: "Correct. Plus standards like ISO/IEC 27037 and accreditation from ASCLD (Ch 3)." },
        { text: "Leave the lab open so staff can collaborate freely", points: 0, correct: false,
          explain: "Access must be restricted and logged. Security is paramount (Ch 3)." },
        { text: "Store evidence on internet-connected shared drives", points: 0, correct: false,
          explain: "That breaks isolation. Use isolated networks and safes (Ch 3)." } ] },
      { prompt: "Which are recognized forensic software tools?", choices: [
        { text: "EnCase and FTK (commercial); The Sleuth Kit & Autopsy (open source)", points: 20, correct: true,
          explain: "Correct. Also OSForensics, Kali Linux, Helix, CopyQM Plus, AnaDisk (Ch 3)." },
        { text: "Photoshop and Excel", points: 0, correct: false,
          explain: "General software, not forensic suites. EnCase/FTK/Autopsy are (Ch 3)." },
        { text: "WhatsApp and Zoom", points: 0, correct: false,
          explain: "Communication apps. Forensic tools are EnCase, FTK, Autopsy, etc. (Ch 3)." } ] },
      { prompt: "Which certification is a good GENERAL starting point (not tied to one vendor's tool)?", choices: [
        { text: "EC-Council CHFI", points: 20, correct: true,
          explain: "Correct. CHFI covers general principles; GCFA/GCFE too. EnCE/ACE are vendor-specific (Ch 3)." },
        { text: "EnCE (EnCase Certified Examiner)", points: 5, correct: false,
          explain: "EnCE is vendor-specific to EnCase. For general principles, CHFI (Ch 3)." },
        { text: "A driver's license", points: 0, correct: false,
          explain: "Not a forensic credential. CHFI is a good general start (Ch 3)." } ] },
      { prompt: "What should the expert report include, at minimum?", choices: [
        { text: "All tests, findings, conclusions, credible supporting sources, and the expert's full CV", points: 20, correct: true,
          explain: "Correct. Thorough reports underpin admissible testimony and avoid 'junk science' claims (Ch 1/3)." },
        { text: "Just a one-line verdict", points: 0, correct: false,
          explain: "Far too thin. Reports must be exhaustive with tests, findings, sources, CV (Ch 3)." },
        { text: "Only the parts that help your side", points: 0, correct: false,
          explain: "Reports must be objective and complete, including peripheral findings (Ch 3)." } ] },
    ],
  },

  // ======================================================================
  // CHAPTER 4a — Seizure & the hunt for evidence
  {
    id: 'case4a',
    title: 'First on Scene',
    crime: 'Ch 4 · Seizure & Evidence Hunt',
    chapter: 4, tier: 'Core',
    chapters: 'Ch 4',
    difficulty: 'Rookie',
    world: 'raid', accent: '#8b7cff', scene: 'The Array', icon: '🚨',
    brief:
      "You are first on scene with a running suspect machine. Seize it without destroying volatile evidence, keep the chain of custody, prove integrity, then hunt for hidden and deleted data and build the timeline.",
    stages: [
      { prompt: "The suspect's computer is ON. What is your FIRST priority?", choices: [
        { text: "Capture volatile data (RAM) — running processes and connections — before shutting down", points: 20, correct: true,
          explain: "Correct. Volatile data is lost at power-off. Check netstat/net sessions/openfiles, take a memory dump (Ch 4)." },
        { text: "Do a normal Windows shutdown immediately", points: 0, correct: false,
          explain: "A normal shutdown alters/deletes temp files and loses RAM. Capture volatile data first (Ch 4)." },
        { text: "Start browsing the user's documents", points: 0, correct: false,
          explain: "Never browse the live original — it alters data (Ch 4)." } ] },
      { prompt: "When you DO power the machine down, which is often better and why?", choices: [
        { text: "Pull the plug — a normal shutdown can alter or delete temp files and other evidence", points: 20, correct: true,
          explain: "Correct. After capturing volatile data, pulling the plug avoids the shutdown process modifying evidence (Ch 4)." },
        { text: "Always use a graceful shutdown to be safe", points: 3, correct: false,
          explain: "Graceful shutdown can alter evidence. After capturing RAM, pulling the plug is often preferred (Ch 4)." },
        { text: "Let the battery drain over days", points: 0, correct: false,
          explain: "Impractical and loses volatile data. Pull the plug after capturing RAM (Ch 4)." } ] },
      { prompt: "Which commands help check live processes/connections before shutdown?", choices: [
        { text: "netstat, net sessions, openfiles", points: 20, correct: true,
          explain: "Correct. These reveal connections, sessions, and open files — malware or unauthorized access (Ch 4)." },
        { text: "format, del, shutdown", points: 0, correct: false,
          explain: "Those alter/destroy the system. Use netstat / net sessions / openfiles (Ch 4)." },
        { text: "ping, tracert only", points: 3, correct: false,
          explain: "Useful network utilities but not for live process/session capture. Use netstat/net sessions/openfiles (Ch 4)." } ] },
      { prompt: "How do you prove no data changed after collection?", choices: [
        { text: "Hash both original and image (MD5/SHA2); matching hashes prove an exact copy", points: 20, correct: true,
          explain: "Correct. A matching hash is mathematical proof — essential for admissibility (Ch 4)." },
        { text: "Compare file counts", points: 0, correct: false,
          explain: "File counts miss single-bit changes/unallocated space. Use a hash (Ch 4)." },
        { text: "Have witnesses sign a note", points: 3, correct: false,
          explain: "Signatures don't prove bit-level integrity. Hashing does (Ch 4)." } ] },
      { prompt: "The swap file (pagefile.sys) is forensically valuable because it:", choices: [
        { text: "Acts as virtual RAM and can hold fragments of documents, passwords, and history — often surviving reboots", points: 20, correct: true,
          explain: "Correct. It's a key place for data recently in memory, persisting after a reboot (Ch 4)." },
        { text: "Contains only the operating system kernel", points: 0, correct: false,
          explain: "No — it's virtual RAM holding recently-used data fragments (Ch 4)." },
        { text: "Is always empty on a powered-off machine", points: 0, correct: false,
          explain: "It often retains data even after reboot — that's why it matters (Ch 4)." } ] },
      { prompt: "Which metadata can images (Exif) reveal?", choices: [
        { text: "Camera used, date/time taken, and even GPS location", points: 20, correct: true,
          explain: "Correct. Exif is 'data about data' — vital for building a timeline (Ch 4)." },
        { text: "The victim's password", points: 0, correct: false,
          explain: "Exif holds camera/date/GPS, not passwords (Ch 4)." },
        { text: "Nothing useful", points: 0, correct: false,
          explain: "Exif reveals camera, date/time, GPS — very useful (Ch 4)." } ] },
      { prompt: "Deleted files were emptied from the Recycle Bin. Recoverable?", choices: [
        { text: "Often yes — deleted data stays in unallocated space until overwritten", points: 20, correct: true,
          explain: "Correct. Emptying just marks space unallocated; tools recover it until overwritten (Ch 4)." },
        { text: "No — emptying erases it permanently", points: 0, correct: false,
          explain: "Emptying doesn't erase data; it's recoverable until overwritten (Ch 4)." },
        { text: "Only if the user reinstalls Windows", points: 0, correct: false,
          explain: "Reinstalling risks overwriting. Data persists in unallocated space until overwritten (Ch 4)." } ] },
      { prompt: "What's the purpose of building a TIMELINE from timestamps and metadata?", choices: [
        { text: "To reconstruct the sequence of events into a coherent narrative of what happened, when, and who was involved", points: 20, correct: true,
          explain: "Correct. Timelines turn isolated data into a story — then present it in plain English (Ch 4)." },
        { text: "To decide which files to delete", points: 0, correct: false,
          explain: "You never delete evidence. Timelines reconstruct events (Ch 4)." },
        { text: "To speed up the computer", points: 0, correct: false,
          explain: "Not a performance task. Timelines build the event narrative (Ch 4)." } ] },
    ],
  },

  // ======================================================================
  // CHAPTER 4b — Storage, imaging & RAID
  {
    id: 'case4b',
    title: 'The Array',
    crime: 'Ch 4 · Storage, Imaging & RAID',
    chapter: 4, tier: 'Advanced',
    chapters: 'Ch 4',
    difficulty: 'Investigator',
    world: 'raid', accent: '#a98bff', scene: 'The Array', icon: '💾',
    brief:
      "Now the technical acquisition: handle each storage medium correctly, know the hidden areas and forensic formats, image with a write blocker, and acquire a RAID 5 array the right way.",
    stages: [
      { prompt: "How must USB drives be accessed during forensics?", choices: [
        { text: "Read-only, or via a hardware write blocker, to avoid altering data", points: 20, correct: true,
          explain: "Correct. USBs use solid-state tech; always block writes to preserve integrity (Ch 4)." },
        { text: "Mounted read-write to browse quickly", points: 0, correct: false,
          explain: "Read-write can alter the evidence. Use read-only / write blocker (Ch 4)." },
        { text: "Formatted first for a clean start", points: 0, correct: false,
          explain: "Never format evidence. Access read-only (Ch 4)." } ] },
      { prompt: "Data from a backup TAPE must be handled how before analysis?", choices: [
        { text: "Restored to a forensically WIPED hard drive first", points: 20, correct: true,
          explain: "Correct. Tapes (DAT/DLT) must be restored to a wiped drive before analysis (Ch 4)." },
        { text: "Analyzed directly on the tape", points: 0, correct: false,
          explain: "Tapes are restored to a wiped drive before analysis (Ch 4)." },
        { text: "Thrown away as obsolete", points: 0, correct: false,
          explain: "Tapes hold archival evidence — restore to a wiped drive (Ch 4)." } ] },
      { prompt: "Which is a hidden area where data can be concealed on a drive?", choices: [
        { text: "The Host Protected Area (HPA), plus slack space and blocks falsely marked 'bad'", points: 20, correct: true,
          explain: "Correct. HPA is manufacturer-reserved; slack (file/volume) and fake bad blocks also hide data (Ch 4)." },
        { text: "The monitor's frame buffer", points: 0, correct: false,
          explain: "That's display memory. Hidden drive areas are HPA, slack, bad blocks (Ch 4)." },
        { text: "The keyboard cache", points: 0, correct: false,
          explain: "Not a drive area. HPA/slack/bad blocks are (Ch 4)." } ] },
      { prompt: "Which is a standard FORENSIC image format?", choices: [
        { text: "AFF (open source), the EnCase format (with a verifying hash), and Gfzip", points: 20, correct: true,
          explain: "Correct. These are verifiable evidence formats; EnCase's includes an integrity hash (Ch 4)." },
        { text: "MP4", points: 0, correct: false,
          explain: "MP4 is video. Forensic formats are AFF, EnCase, Gfzip (Ch 4)." },
        { text: "DOCX", points: 0, correct: false,
          explain: "DOCX is a document. Forensic image formats are AFF/EnCase/Gfzip (Ch 4)." } ] },
      { prompt: "Before imaging, the two key prep steps are:", choices: [
        { text: "Connect the original through a write blocker AND forensically wipe the destination drive", points: 20, correct: true,
          explain: "Correct. Write blocker prevents changes; wiping prevents old data contaminating the image (Ch 4)." },
        { text: "Defragment the original and compress it", points: 0, correct: false,
          explain: "Never modify the original. Use a write blocker + wiped destination (Ch 4)." },
        { text: "Encrypt the original and email it", points: 0, correct: false,
          explain: "That alters/exposes evidence. Write blocker + wiped destination (Ch 4)." } ] },
      { prompt: "In FTK Imager, which source type ensures a complete copy including deleted files and unallocated space?", choices: [
        { text: "Physical Drive", points: 20, correct: true,
          explain: "Correct. Choosing Physical Drive captures the whole disk, not just logical files (Ch 4)." },
        { text: "A single logical folder", points: 0, correct: false,
          explain: "A logical selection misses deleted/unallocated data. Choose Physical Drive (Ch 4)." },
        { text: "Screenshot of the desktop", points: 0, correct: false,
          explain: "Not an image at all. Choose Physical Drive (Ch 4)." } ] },
      { prompt: "The manual imaging method uses which classic Linux tools?", choices: [
        { text: "dd (bit-for-bit copy) piped through netcat to a forensic server", points: 20, correct: true,
          explain: "Correct. dd performs the low-level copy; netcat transfers it over the network (Ch 4)." },
        { text: "Word and Outlook", points: 0, correct: false,
          explain: "Office apps, not imaging tools. It's dd + netcat (Ch 4)." },
        { text: "chrome and curl", points: 0, correct: false,
          explain: "Not the imaging method. It's dd piped through netcat (Ch 4)." } ] },
      { prompt: "The server is RAID 5 (striping with parity across 3 drives). How do you acquire it?", choices: [
        { text: "Image the entire array as a single logical volume", points: 20, correct: true,
          explain: "Correct. Striped arrays (RAID 0/5) must be imaged as the assembled volume; only RAID 1 mirrors go drive-by-drive (Ch 4)." },
        { text: "Image each drive separately", points: 0, correct: false,
          explain: "Wrong for striping — each drive holds only a fraction. Image the whole array (Ch 4)." },
        { text: "Image only the parity data", points: 0, correct: false,
          explain: "Parity is distributed and isn't the data. Image the full logical volume (Ch 4)." } ] },
      { prompt: "In RAID 5, parity that lets a lost drive be rebuilt is computed by:", choices: [
        { text: "Exclusive OR (XOR) across the data drives", points: 20, correct: true,
          explain: "Correct. XOR the survivors + parity to reconstruct a failed drive (Ch 4)." },
        { text: "Keeping a full ZIP backup", points: 0, correct: false,
          explain: "Parity isn't a full copy — it's a computed XOR value (Ch 4)." },
        { text: "MD5-hashing each block", points: 3, correct: false,
          explain: "Hashing verifies integrity but can't rebuild data. Parity uses XOR (Ch 4)." } ] },
    ],
  },
];

if (typeof window !== 'undefined') window.CASES = CASES;
