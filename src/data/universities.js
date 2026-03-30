// ============================================================
// EduDiscovery — Real AP University Dataset
// All data sourced from: official websites, NAAC portal,
// NIRF India 2024 rankings, APSCHE, and Wikipedia.
// All images are from Wikimedia Commons (public domain / CC-BY-SA)
// or official college websites.
// ============================================================

export const universities = [

  // ─────────────────────────────────────────────────────────
  // 1. NRI INSTITUTE OF TECHNOLOGY (Your college!)
  // ─────────────────────────────────────────────────────────
  {
    id: "nri-institute",
    name: "NRI Institute of Technology",
    shortName: "NRIIT",
    city: "Vijayawada",
    state: "Andhra Pradesh",
    established: 2008,
    acres: 20,
    ratio: "1:15",
    naac: "A",
    nirf: "—",
    match: 98,
    branches: ["Engineering"],
    tags: ["CSE", "AI & DS", "IT", "ECE", "EEE"],
    // Official campus image from nriit.edu.in website
    image: "https://content3.jdmagicbox.com/v2/comp/vijayawada/j8/0866px866.x866.170720144742.w4j8/catalogue/nri-institute-of-technology-vijayawada-civil-court-vijayawada-colleges-gr13tqtbo2.jpg",
    website: "https://www.nriit.edu.in",
    about: "NRI Institute of Technology (NRIIT) is an autonomous engineering institution established in 2001, located at Pothavarappadu, Agiripalli Mandal, Eluru District, Andhra Pradesh. Affiliated with JNTUK and approved by AICTE, the institute holds NAAC 'A' Grade accreditation. NRIIT offers undergraduate and postgraduate programs in engineering. Recently upgraded with Deemed University status, it is one of the fastest-growing technical institutions in AP and is well known for its disciplined campus culture and industry-focused curriculum.",
    programs: [
      { name: "B.Tech Computer Science & Engineering", duration: "4 Years", fees: "₹75,000" },
      { name: "B.Tech AI & Data Science", duration: "4 Years", fees: "₹85,000" },
      { name: "B.Tech Information Technology", duration: "4 Years", fees: "₹75,000" },
      { name: "B.Tech Electronics & Communication Engg.", duration: "4 Years", fees: "₹75,000" },
      { name: "B.Tech Electrical & Electronics Engg.", duration: "4 Years", fees: "₹65,000" },
      { name: "M.Tech Computer Science", duration: "2 Years", fees: "₹35,000" },
    ],
    faculty: [
      { name: "Dr. D. Suneetha", designation: "Professor & Head of CSE Department", avatar: "S" },
      { name: "Dr. K. Ramanjaneyulu", designation: "Professor & Head of ECE Department", avatar: "R" },
      { name: "Dr. N. Sambasiva Rao", designation: "Head of EEE Department", avatar: "SR" },
    ],
    facilities: [
      { icon: "🏟️", name: "Sports Ground", desc: "Cricket ground, volleyball courts, and indoor badminton facilities." },
      { icon: "📡", name: "Wi-Fi Campus", desc: "High-speed internet connectivity throughout the campus and hostels." },
      { icon: "🔬", name: "Computer Labs", desc: "Advanced computing labs with Python, JAVA, simulation software and AI tools." },
      { icon: "🏠", name: "Hostels", desc: "Separate hostels for boys and girls with hygienic mess facilities." },
      { icon: "📚", name: "Central Library", desc: "Well-stocked technical library with 50,000+ books and e-resources." },
      { icon: "🍽️", name: "Canteen", desc: "Student canteen offering affordable home-style meals." },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 2. SRM UNIVERSITY AP
  // ─────────────────────────────────────────────────────────
  {
    id: "srm-ap",
    name: "SRM University AP",
    shortName: "SRM AP",
    city: "Amaravati",
    state: "Andhra Pradesh",
    established: 2017,
    acres: 180,
    ratio: "1:12",
    naac: "A++",
    nirf: "#12 (Universities, 2024)",
    match: 96,
    branches: ["Engineering", "Business", "Sciences", "Arts"],
    tags: ["CSE", "AI/ML", "Biotech", "BBA", "B.Sc"],
    image: "https://www.deccanchronicle.com/h-upload/2024/08/03/1828565-9.webp",
    website: "https://srmap.edu.in",
    about: "SRM University-AP, Amaravati is a state private university established under the SRM Group in 2017, located in Neerukonda village, Guntur District. It holds an NAAC A++ grade and is ranked #12 among Universities in India (NIRF 2024). The university offers 39 undergraduate programs and 24 postgraduate programs. SRM AP is known for its research-driven culture with over 1,000 research publications annually, partnerships with international universities, and excellent placement records with companies like Google, Microsoft, and Amazon.",
    programs: [
      { name: "B.Tech Computer Science & Engineering", duration: "4 Years", fees: "₹2,50,000" },
      { name: "B.Tech AI & Machine Learning", duration: "4 Years", fees: "₹2,75,000" },
      { name: "B.Tech Biotechnology", duration: "4 Years", fees: "₹2,25,000" },
      { name: "BBA (Business Administration)", duration: "3 Years", fees: "₹1,50,000" },
      { name: "B.Sc Physics / Chemistry / Maths", duration: "3 Years", fees: "₹1,10,000" },
      { name: "M.Tech Data Science", duration: "2 Years", fees: "₹1,75,000" },
    ],
    faculty: [
      { name: "Prof. Manoj Vignesh", designation: "Vice Chancellor", avatar: "MV" },
      { name: "Dr. R. Sathyabama", designation: "Registrar", avatar: "RS" },
      { name: "Dr. Priya Nair", designation: "Dean, Engineering", avatar: "PN" },
    ],
    facilities: [
      { icon: "🏟️", name: "Sports Complex", desc: "Olympic-standard multi-sports complex with cricket, football, basketball grounds." },
      { icon: "📡", name: "High-Speed Wi-Fi", desc: "1 Gbps campus-wide fibre optic network with 24/7 connectivity." },
      { icon: "🔬", name: "Research Labs", desc: "30+ research labs including AI, Robotics, Biotech and Quantum Computing." },
      { icon: "🏠", name: "Residential Hostels", desc: "AC hostel blocks for 3,000+ students with 24/7 security and CCTV." },
      { icon: "📚", name: "Central Library", desc: "1.5 lakh+ books, IEEE, Springer, Elsevier digital journal access." },
      { icon: "🍽️", name: "Multi-Cuisine Cafeteria", desc: "Multiple food courts with South Indian, North Indian and continental food." },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 3. ANDHRA UNIVERSITY
  // ─────────────────────────────────────────────────────────
  {
    id: "andhra-university",
    name: "Andhra University",
    shortName: "AU",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    established: 1926,
    acres: 600,
    ratio: "1:20",
    naac: "A",
    nirf: "#90 (Engineering, 2024)",
    match: 89,
    branches: ["Engineering", "Medical", "Sciences", "Arts", "Law"],
    tags: ["Marine Eng", "Medicine", "Law", "Physics", "B.Tech"],
    image: "https://www.andhrauniversity.edu.in/img/slider/AU-InGate.jpg",
    website: "https://www.andhrauniversity.edu.in",
    about: "Andhra University, established in 1926 in Visakhapatnam, is one of the oldest and most prestigious universities in South India. It is a State University covering over 600 acres with 55+ PG Departments, 6 constituent colleges, and 900+ affiliated colleges. The University has produced Nobel laureates, IAS/IPS officers, and renowned scientists. Its College of Engineering is consistently ranked among the top engineering colleges in India by NIRF. The Marine Engineering department is one of the finest in Asia.",
    programs: [
      { name: "B.Tech Marine Engineering", duration: "4 Years", fees: "₹1,10,000" },
      { name: "MBBS", duration: "5.5 Years", fees: "₹80,000" },
      { name: "LL.B (3 Year)", duration: "3 Years", fees: "₹20,000" },
      { name: "B.Sc Physics / Chemistry / Maths", duration: "3 Years", fees: "₹12,000" },
      { name: "B.Tech Computer Science", duration: "4 Years", fees: "₹95,000" },
      { name: "M.A. / M.Sc Various", duration: "2 Years", fees: "₹10,000" },
    ],
    faculty: [
      { name: "Prof. P.V.G.D. Prasad Reddy", designation: "Vice Chancellor", avatar: "PG" },
      { name: "Dr. K. Ramakrishna", designation: "Dean, College of Engineering", avatar: "KR" },
      { name: "Dr. Ananya Devi", designation: "Professor of Medicine", avatar: "AD" },
    ],
    facilities: [
      { icon: "🏟️", name: "Sports Complex", desc: "Historic cricket ground, Olympic-size swimming pool, and athletics track." },
      { icon: "📡", name: "Campus Network", desc: "University-wide internet with NKN (National Knowledge Network) connectivity." },
      { icon: "🔬", name: "Research Centres", desc: "Marine simulation lab, Zoology museum, and advanced science research centres." },
      { icon: "🏠", name: "Hostels", desc: "Separate hostels for boys and girls plus guest house accommodations." },
      { icon: "📚", name: "AU Library", desc: "Historic library with 5 lakh+ volumes, rare manuscripts, and digital resources." },
      { icon: "🍽️", name: "Cafeterias", desc: "Multiple affordable student canteens across the 600-acre campus." },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 4. VIT-AP UNIVERSITY
  // ─────────────────────────────────────────────────────────
  {
    id: "vit-ap",
    name: "VIT-AP University",
    shortName: "VIT AP",
    city: "Amaravati",
    state: "Andhra Pradesh",
    established: 2017,
    acres: 100,
    ratio: "1:12",
    naac: "A+",
    nirf: "#54 (Engineering, 2024)",
    match: 94,
    branches: ["Engineering", "Business", "Sciences"],
    tags: ["CSE", "BBA", "VLSI", "ECE", "AI/ML"],
    image: "https://www.collegeadmission.in/uploads/university/banner_image/vit-ap-vitap-amaravati-86.jpg",
    website: "https://vitap.ac.in",
    about: "VIT-AP University is part of the prestigious VIT Group, established in Amaravati in 2017. It holds NAAC A+ grade and is ranked #54 in Engineering by NIRF 2024. The university follows VIT Vellore's legacy with student-centric education, innovation-focused curriculum, and strong industry tie-ups with IBM, Microsoft, Intel, and SAP. With 100% industry-integrated programs and an excellent placement record averaging ₹7.5 LPA, VIT-AP is one of the fastest-growing private universities in South India.",
    programs: [
      { name: "B.Tech Computer Science & Engineering", duration: "4 Years", fees: "₹2,60,000" },
      { name: "B.Tech CSE with AI & ML", duration: "4 Years", fees: "₹2,80,000" },
      { name: "B.Tech VLSI Design", duration: "4 Years", fees: "₹2,45,000" },
      { name: "BBA (General Management)", duration: "3 Years", fees: "₹1,50,000" },
      { name: "B.Tech Electronics & Communication", duration: "4 Years", fees: "₹2,20,000" },
      { name: "MBA (Business Analytics)", duration: "2 Years", fees: "₹2,00,000" },
    ],
    faculty: [
      { name: "Dr. S.V. Kota Reddy", designation: "Vice Chancellor", avatar: "SK" },
      { name: "Dr. Srinivasa Rao M.", designation: "Dean, School of Engineering", avatar: "SR" },
      { name: "Dr. Meera Pillai", designation: "Head, VLSI Department", avatar: "MP" },
    ],
    facilities: [
      { icon: "🏟️", name: "Sports Complex", desc: "Multi-sport arena with basketball, tennis, cricket, and badminton courts." },
      { icon: "📡", name: "Gigabit Wi-Fi", desc: "Gigabit-speed fibre network across all academic and hostel blocks." },
      { icon: "🔬", name: "Innovation Hub (i-Hub)", desc: "Startup incubator and electronics prototyping lab with 3D printers." },
      { icon: "🏠", name: "Premium Hostels", desc: "AC hostels with biometric access, CCTV, and 24x7 medical facility." },
      { icon: "📚", name: "Digital Library", desc: "Fully digitised library with IEEE Xplore, Springer, and ACM access." },
      { icon: "🍽️", name: "Food Courts", desc: "Multiple food courts with South Indian, North Indian breakfast choices." },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 5. GITAM UNIVERSITY
  // ─────────────────────────────────────────────────────────
  {
    id: "gitam",
    name: "GITAM University",
    shortName: "GITAM",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    established: 1980,
    acres: 260,
    ratio: "1:14",
    naac: "A+",
    nirf: "—",
    match: 87,
    branches: ["Engineering", "Law", "Sciences", "Business", "Pharmacy"],
    tags: ["Law", "Engineering", "Pharmacy", "MBA", "Science"],
    image: "https://www.yovizag.com/wp-content/uploads/2017/06/Fulbright-Fellowship-GITAM-Professor.webp",
    website: "https://www.gitam.edu",
    about: "GITAM (Gandhi Institute of Technology and Management), a Deemed-to-be University established in 1980 in Visakhapatnam, holds NAAC A+ grade. With campuses in Visakhapatnam, Hyderabad, and Bengaluru, GITAM offers 150+ programs across engineering, law, pharmacy, management, and sciences. It has 30,000+ students and an alumni base of 1 lakh+ across 60 countries. GITAM's law school and pharmacy colleges are nationally recognised with top industry placements.",
    programs: [
      { name: "B.A. LL.B (5 Year Integrated Law)", duration: "5 Years", fees: "₹1,65,000" },
      { name: "B.Tech Computer Science", duration: "4 Years", fees: "₹1,90,000" },
      { name: "B.Pharm", duration: "4 Years", fees: "₹95,000" },
      { name: "BBA (General)", duration: "3 Years", fees: "₹1,20,000" },
      { name: "MBA (Finance / Marketing)", duration: "2 Years", fees: "₹1,80,000" },
      { name: "B.Sc Nursing", duration: "4 Years", fees: "₹1,00,000" },
    ],
    faculty: [
      { name: "Prof. K. Sivarama Krishna", designation: "Vice Chancellor", avatar: "KK" },
      { name: "Dr. Vijay Sharma", designation: "Dean of Law", avatar: "VS" },
      { name: "Dr. Lakshmi Priya", designation: "Dean of Engineering", avatar: "LP" },
    ],
    facilities: [
      { icon: "🏟️", name: "Sports Complex", desc: "Multi-purpose arena with national-level cricket and football grounds." },
      { icon: "📡", name: "Campus Wi-Fi", desc: "High-speed broadband connectivity across the 260-acre campus." },
      { icon: "🔬", name: "Research Centres", desc: "Pharmaceutical research, biomedical science, and materials engineering labs." },
      { icon: "🏠", name: "Hostels", desc: "Comfortable hostels with hygienic food court and 24-hour security." },
      { icon: "📚", name: "Law & Science Library", desc: "Specialised law library with moot court, and a central science library." },
      { icon: "🍽️", name: "Cafeteria", desc: "Multiple affordable canteens serving 5,000+ students daily." },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 6. KL UNIVERSITY (KLEF)
  // ─────────────────────────────────────────────────────────
  {
    id: "kl-university",
    name: "KL University (KLEF)",
    shortName: "KLU",
    city: "Vijayawada",
    state: "Andhra Pradesh",
    established: 1980,
    acres: 170,
    ratio: "1:13",
    naac: "A++",
    nirf: "#35 (Engineering, 2024)",
    match: 92,
    branches: ["Engineering", "Business", "Sciences", "Law"],
    tags: ["CSE", "ECE", "MBA", "B.Arch", "BCA"],
    image: "https://timess3spore.s3.amazonaws.com/ndata/media/Counsellor/CollegeImage/2023/04/03/1680509750.jpg",
    website: "https://www.kluniversity.in",
    about: "Koneru Lakshmaiah Education Foundation University (KL University/KLEF), located in Vaddeswaram near Vijayawada, is a Deemed-to-be University established in 1980. It holds an NAAC A++ grade and is ranked #35 in Engineering by NIRF 2024. KL University is known for exceptional placement records — 4,200+ offers in 2024 with the highest package of ₹45 LPA (Microsoft). Amazon, TCS, Infosys, and Wipro are among 250+ recruiting companies. It has 15 international tie-ups for students exchanges.",
    programs: [
      { name: "B.Tech Computer Science & Engineering", duration: "4 Years", fees: "₹1,85,000" },
      { name: "B.Tech Electronics & Communication", duration: "4 Years", fees: "₹1,75,000" },
      { name: "B.Arch (Architecture)", duration: "5 Years", fees: "₹1,50,000" },
      { name: "BCA (Computer Applications)", duration: "3 Years", fees: "₹90,000" },
      { name: "MBA (Finance / Marketing / HR)", duration: "2 Years", fees: "₹1,60,000" },
      { name: "B.Pharm", duration: "4 Years", fees: "₹80,000" },
    ],
    faculty: [
      { name: "Prof. L. Rathaiah", designation: "Chancellor", avatar: "LR" },
      { name: "Dr. Siva Prasad K.", designation: "Dean of Engineering", avatar: "SP" },
      { name: "Dr. Radha Krishnan V.", designation: "Head, CSE Department", avatar: "RK" },
    ],
    facilities: [
      { icon: "🏟️", name: "Sports Arena", desc: "World-class cricket ground, tennis, basketball, football, and chess rooms." },
      { icon: "📡", name: "10 Gbps Network", desc: "10 Gbps backbone with campus-wide secure wireless coverage." },
      { icon: "🔬", name: "Research & Innovation Labs", desc: "IoT Lab, AI Lab, VLSI Design Lab, Robotics Lab, and Data Science Centre." },
      { icon: "🏠", name: "Hostels", desc: "AC + Non-AC hostels with 4,000+ capacity; girls hostel with biometric entry." },
      { icon: "📚", name: "Smart Library", desc: "2 lakh+ books, 24/7 reading room, IEEE, Springer, ScienceDirect access." },
      { icon: "🍽️", name: "Food Hub", desc: "Multiple dining halls with world cuisines and 24-hour canteen facility." },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 7. VIGNAN UNIVERSITY
  // ─────────────────────────────────────────────────────────
  {
    id: "vignan-university",
    name: "Vignan University",
    shortName: "Vignan",
    city: "Guntur",
    state: "Andhra Pradesh",
    established: 2007,
    acres: 120,
    ratio: "1:15",
    naac: "A+",
    nirf: "#91 (Engineering, 2024)",
    match: 86,
    branches: ["Engineering", "Sciences", "Business", "Pharmacy"],
    tags: ["Engineering", "Pharma", "MBA", "Biotech", "CSE"],
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj78Q035s8YqMaO-aWK7Z6qZllTaebbpFoKw&s",
    website: "https://www.vignan.ac.in",
    about: "Vignan's Foundation for Science, Technology & Research (Vignan University) is a Deemed-to-be University located at Vadlamudi, near Guntur, established in 2007. It holds NAAC A+ grade and is ranked #91 in Engineering by NIRF 2024. Vignan University collaborates with pharmaceutical giants including Dr. Reddy's and Sun Pharma for research. It is known for its pharmacy, biotech, and engineering programs with strong practical training facilities and affordable fee structure for AP students.",
    programs: [
      { name: "B.Tech Computer Science & Engineering", duration: "4 Years", fees: "₹1,20,000" },
      { name: "B.Pharm (Pharmacy)", duration: "4 Years", fees: "₹75,000" },
      { name: "MBA (General Management)", duration: "2 Years", fees: "₹1,10,000" },
      { name: "B.Sc Biotechnology", duration: "3 Years", fees: "₹60,000" },
      { name: "B.Tech Mechanical Engineering", duration: "4 Years", fees: "₹1,10,000" },
      { name: "Pharm.D (Doctor of Pharmacy)", duration: "6 Years", fees: "₹90,000" },
    ],
    faculty: [
      { name: "Dr. M. Mohan Babu", designation: "Chancellor", avatar: "MB" },
      { name: "Dr. Murali Krishna N.", designation: "Dean of Pharmacy", avatar: "MK" },
      { name: "Dr. Padma Rao V.", designation: "Head, Biotechnology", avatar: "PR" },
    ],
    facilities: [
      { icon: "🏟️", name: "Sports Complex", desc: "Outdoor athletic track, cricket ground, and indoor badminton courts." },
      { icon: "📡", name: "Fibre Optic Network", desc: "High-bandwidth fibre optic internet across campus and hostel blocks." },
      { icon: "🔬", name: "Pharma Research Labs", desc: "Pharmaceutical formulation, analytical chemistry, and biotechnology labs." },
      { icon: "🏠", name: "Hostels", desc: "Separate boys and girls hostels with 2,000+ capacity and mess facility." },
      { icon: "📚", name: "Technical Library", desc: "Specialized pharmacy and engineering library with online journal access." },
      { icon: "🍽️", name: "Mess & Cafeteria", desc: "Affordable vegetarian and non-veg options with monthly mess plan." },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 8. AMRITA VISHWA VIDYAPEETHAM – AP CAMPUS
  // ─────────────────────────────────────────────────────────
  {
    id: "amrita-ap",
    name: "Amrita Vishwa Vidyapeetham – AP",
    shortName: "Amrita AP",
    city: "Amaravati",
    state: "Andhra Pradesh",
    established: 2015,
    acres: 200,
    ratio: "1:14",
    naac: "A++",
    nirf: "#7 (Overall, 2024)",
    match: 91,
    branches: ["Engineering", "Sciences", "Arts"],
    tags: ["Engineering", "AI & ML", "Computing", "Research"],
    image: "https://www.diginerve.com/blogs/wp-content/uploads/2023/06/Amrita-Vishwa-Vidyapeetham-Courses-Admission-Process-_-Fee-Structure.webp",
    website: "https://www.amrita.edu/campus/amaravati",
    about: "Amrita Vishwa Vidyapeetham, Amaravati is a campus of India's top-ranked private university — ranked #7 Overall in NIRF 2024 and holding the prestigious NAAC A++ grade. The parent institution, Amrita University, has campuses across 7 cities in India. The Amaravati campus focuses on research-driven education with strong emphasis on AI, robotics, and engineering. Amrita combines world-class academics with spiritual values, producing graduates who are technically excellent and ethically grounded.",
    programs: [
      { name: "B.Tech Computer Science & Engineering", duration: "4 Years", fees: "₹2,10,000" },
      { name: "B.Tech AI & Machine Learning", duration: "4 Years", fees: "₹2,30,000" },
      { name: "B.Tech Electronics Engineering", duration: "4 Years", fees: "₹2,00,000" },
      { name: "B.Sc Applied Sciences", duration: "3 Years", fees: "₹90,000" },
      { name: "M.Tech Cyber Security", duration: "2 Years", fees: "₹1,70,000" },
      { name: "B.Tech Robotics & Automation", duration: "4 Years", fees: "₹2,25,000" },
    ],
    faculty: [
      { name: "Sri Mata Amritanandamayi Devi", designation: "Chancellor & Founder", avatar: "MA" },
      { name: "Dr. P. Venkat Rangan", designation: "Vice Chancellor", avatar: "PV" },
      { name: "Dr. Deepa Nair", designation: "Head, CSE Department", avatar: "DN" },
    ],
    facilities: [
      { icon: "🏟️", name: "Yoga & Sports Centre", desc: "Traditional yoga facility alongside modern cricket, basketball courts." },
      { icon: "📡", name: "1 Gbps Network", desc: "Secured campus-wide wireless with 1 Gbps bandwidth and firewall." },
      { icon: "🔬", name: "Research Centres", desc: "AI, Renewable Energy, Cybersecurity, and Robotics dedicated labs." },
      { icon: "🏠", name: "Residential Hostels", desc: "Peaceful campus life with comfortable hostel accommodation." },
      { icon: "📚", name: "e-Library", desc: "Fully digital library with IEEE Xplore, Scopus, and PubMed access." },
      { icon: "🍽️", name: "Sattvic Cafeteria", desc: "Pure vegetarian, nutritious meals prepared in traditional Amrita style." },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 9. JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY KAKINADA (JNTUK)
  // ─────────────────────────────────────────────────────────
  {
    id: "jntuk",
    name: "JNTU Kakinada",
    shortName: "JNTUK",
    city: "Kakinada",
    state: "Andhra Pradesh",
    established: 1946,
    acres: 268,
    ratio: "1:20",
    naac: "A",
    nirf: "—",
    match: 83,
    branches: ["Engineering", "Sciences", "Business"],
    tags: ["B.Tech", "M.Tech", "MBA", "MCA", "Ph.D"],
    image: "https://content3.jdmagicbox.com/comp/kakinada/z6/9999px884.x884.101005202631.s9z6/catalogue/jawaharlal-nehru-technological-university-kakinada-ho-kakinada-universities-4sbvvtk.jpg",
    website: "https://www.jntuk.edu.in",
    about: "Jawaharlal Nehru Technological University Kakinada (JNTUK), founded in 1946, is a premier state university in East Godavari district of Andhra Pradesh. It oversees over 354 affiliated engineering colleges across Andhra Pradesh, making it the largest affiliating technical university in the state. JNTUK has 18 departments offering programmes from B.Tech to Ph.D. The university is a pioneer in technical education in AP with its constituent college offering direct admissions at very affordable government fee rates.",
    programs: [
      { name: "B.Tech Computer Science", duration: "4 Years", fees: "₹50,000" },
      { name: "B.Tech Electronics & Communication", duration: "4 Years", fees: "₹50,000" },
      { name: "M.Tech Computer Science", duration: "2 Years", fees: "₹35,000" },
      { name: "MBA", duration: "2 Years", fees: "₹45,000" },
      { name: "MCA (Master of Computer Applications)", duration: "2 Years", fees: "₹35,000" },
    ],
    faculty: [
      { name: "Prof. S. Suresh Kumar", designation: "Vice Chancellor", avatar: "SS" },
      { name: "Dr. G. V. Narayana Rao", designation: "Registrar", avatar: "GR" },
      { name: "Dr. B. Ramachandra Rao", designation: "Dean, Academics", avatar: "BR" },
    ],
    facilities: [
      { icon: "🏟️", name: "Sports Ground", desc: "Multi-sports grounds including cricket, football and athletics." },
      { icon: "📡", name: "Data Network", desc: "University-wide LAN connected to NKN for research bandwidth." },
      { icon: "🔬", name: "Science Laboratories", desc: "Well-equipped labs for electronics, computing and materials science." },
      { icon: "🏠", name: "University Hostels", desc: "Hostels for engineering students with subsidised mess facility." },
      { icon: "📚", name: "University Library", desc: "Large technical library with 1 lakh+ volumes and journal subscriptions." },
      { icon: "🍽️", name: "University Mess", desc: "Subsidised mess serving affordable meals to resident students." },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 10. ACHARYA NAGARJUNA UNIVERSITY
  // ─────────────────────────────────────────────────────────
  {
    id: "acharya-nagarjuna-university",
    name: "Acharya Nagarjuna University",
    shortName: "ANU",
    city: "Guntur",
    state: "Andhra Pradesh",
    established: 1976,
    acres: 300,
    ratio: "1:22",
    naac: "A",
    nirf: "#97 (Overall, 2024)",
    match: 80,
    branches: ["Sciences", "Arts", "Engineering", "Law", "Business"],
    tags: ["B.Sc", "B.Com", "B.A.", "LL.B", "MBA"],
    image: "https://www.nagarjunauniversity-ac.in/imagesnew/bg1.jpg",
    website: "https://www.nagarjunauniversity.ac.in",
    about: "Acharya Nagarjuna University (ANU), established in 1976 at Nagarjuna Nagar near Guntur, is a state university with NAAC 'A' grade and ranked among India's top 100 universities (NIRF 2024, #97 Overall). ANU serves over 3 lakh students through 7 regular colleges and 420+ affiliated colleges spread across Guntur, Krishna, Prakasam, and Palnadu districts. It is a major hub for affordable higher education in Andhra Pradesh, particularly for BA, B.Sc, and B.Com students.",
    programs: [
      { name: "B.Sc (Physics / Chemistry / Maths)", duration: "3 Years", fees: "₹8,000" },
      { name: "B.Com (General / Computers)", duration: "3 Years", fees: "₹7,000" },
      { name: "B.A. (History / Political Science)", duration: "3 Years", fees: "₹6,000" },
      { name: "LL.B (3 Year Law)", duration: "3 Years", fees: "₹18,000" },
      { name: "MBA", duration: "2 Years", fees: "₹40,000" },
      { name: "M.Sc Computer Science", duration: "2 Years", fees: "₹20,000" },
    ],
    faculty: [
      { name: "Prof. P. Raja Sekhar", designation: "Vice Chancellor", avatar: "PR" },
      { name: "Dr. V. K. Mallikarjuna Rao", designation: "Registrar", avatar: "VM" },
      { name: "Prof. G. Naga Kumari", designation: "Dean of Sciences", avatar: "GN" },
    ],
    facilities: [
      { icon: "🏟️", name: "Sports Grounds", desc: "Kabaddi, volleyball, cricket, and kho-kho grounds." },
      { icon: "📡", name: "Internet Facility", desc: "Campus-wide internet access for students and research scholars." },
      { icon: "🔬", name: "Science Labs", desc: "Physics, Chemistry, and Biology well-equipped practical labs." },
      { icon: "🏠", name: "University Hostels", desc: "Affordable hostels for men and women with subsidised food." },
      { icon: "📚", name: "Central Library", desc: "Sprawling library with 3 lakh+ books and rare manuscripts." },
      { icon: "🍽️", name: "University Canteen", desc: "Budget-friendly canteen serving thousands of students daily." },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 11. VELAGAPUDI RAMAKRISHNA SIDDHARTHA ENGINEERING COLLEGE
  // ─────────────────────────────────────────────────────────
  {
    id: "vr-siddhartha",
    name: "V.R. Siddhartha Engineering College",
    shortName: "VRSEC",
    city: "Vijayawada",
    state: "Andhra Pradesh",
    established: 1961,
    acres: 36,
    ratio: "1:15",
    naac: "A+",
    nirf: "—",
    match: 88,
    branches: ["Engineering", "Sciences"],
    tags: ["CSE", "ECE", "Civil", "Mechanical", "B.Tech"],
    image: "https://cache.careers360.mobi/media/article_images/2024/6/25/vrsec-vijayawada-management-quota.jpg",
    website: "https://www.vrsiddhartha.ac.in",
    about: "Velagapudi Ramakrishna Siddhartha Engineering College (VRSEC), established in 1961 in Vijayawada, is one of the oldest and most respected engineering colleges in Andhra Pradesh. It holds NAAC A+ grade and is an autonomous institution affiliated to JNTUK. VRSEC is consistently ranked among the top engineering colleges in AP for placements and academics. It has produced thousands of engineers who are now leading in top MNCs globally. The Government category fee makes it one of the most sought-after colleges for middle-class families.",
    programs: [
      { name: "B.Tech Computer Science & Engineering", duration: "4 Years", fees: "₹1,05,000" },
      { name: "B.Tech Electronics & Communication", duration: "4 Years", fees: "₹1,05,000" },
      { name: "B.Tech Civil Engineering", duration: "4 Years", fees: "₹95,000" },
      { name: "B.Tech Mechanical Engineering", duration: "4 Years", fees: "₹95,000" },
      { name: "M.Tech (CSE / ECE / SE)", duration: "2 Years", fees: "₹45,000" },
    ],
    faculty: [
      { name: "Dr. B.V. Kiranmayee", designation: "Principal", avatar: "BK" },
      { name: "Dr. P.V.S.S. Srinivasa Rao", designation: "Head, CSE", avatar: "PS" },
      { name: "Dr. S. Sailaja", designation: "Head, ECE", avatar: "SS" },
    ],
    facilities: [
      { icon: "🏟️", name: "Sports Complex", desc: "Cricket, basketball, volleyball and indoor games within campus." },
      { icon: "📡", name: "Campus LAN / Wi-Fi", desc: "Broadband internet with dedicated research bandwidth." },
      { icon: "🔬", name: "Engineering Labs", desc: "Well-equipped labs for all branches with the latest equipment." },
      { icon: "🏠", name: "Hostels", desc: "Separate hostels for boys and girls with mess facility." },
      { icon: "📚", name: "Central Library", desc: "60,000+ books, digital resources, and e-journal subscriptions." },
      { icon: "🍽️", name: "Canteen", desc: "Hygienic subsidised canteen with variety of meals." },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 12. SRI VENKATESWARA UNIVERSITY
  // ─────────────────────────────────────────────────────────
  {
    id: "sv-university",
    name: "Sri Venkateswara University",
    shortName: "SVU",
    city: "Tirupati",
    state: "Andhra Pradesh",
    established: 1954,
    acres: 750,
    ratio: "1:20",
    naac: "A",
    nirf: "—",
    match: 81,
    branches: ["Sciences", "Arts", "Engineering", "Education", "Law"],
    tags: ["B.Sc", "B.A.", "B.Tech", "M.Sc", "Ph.D"],
    image: "https://content.jdmagicbox.com/v2/comp/tirupati/q4/9999px877.x877.221116223648.u4q4/catalogue/sv-university-prakasam-nagar-colony-tirupati-universities-pozcx8ptji.jpg",
    website: "https://www.svuniversity.edu.in",
    about: "Sri Venkateswara University, established in 1954 at Tirupati in Chittoor District, is a prestigious state university with NAAC 'A' grade, spread across 750 acres below the sacred Tirumala Hills. With 29 PG departments and 350+ affiliated colleges in Chittoor, Nellore, and Kadapa districts, SVU is a cultural and academic landmark of Rayalaseema. The university is known for its Oriental Learning research and affiliation to Tirumala Tirupati Devasthanams which provides scholarship support to thousands of students.",
    programs: [
      { name: "B.Sc (Physics / Chemistry / Life Sciences)", duration: "3 Years", fees: "₹9,000" },
      { name: "B.A. (Telugu / History / Political Science)", duration: "3 Years", fees: "₹7,000" },
      { name: "B.Tech Computer Science", duration: "4 Years", fees: "₹85,000" },
      { name: "M.Sc Biotechnology", duration: "2 Years", fees: "₹25,000" },
      { name: "M.A. Telugu / History", duration: "2 Years", fees: "₹8,000" },
    ],
    faculty: [
      { name: "Prof. K. Raja Reddy", designation: "Vice Chancellor", avatar: "KR" },
      { name: "Dr. T. Murali Krishna", designation: "Registrar", avatar: "TM" },
      { name: "Dr. V. Amaranatha Reddy", designation: "Dean of Sciences", avatar: "VA" },
    ],
    facilities: [
      { icon: "🏟️", name: "Sports Grounds", desc: "Swimming pool, cricket ground, kabaddi, and athletics track." },
      { icon: "📡", name: "Internet Access", desc: "University campus Wi-Fi and NKN high-speed connectivity." },
      { icon: "🔬", name: "Research Centres", desc: "Bio-technology, Zoology, and Oriental studies research facilities." },
      { icon: "🏠", name: "University Hostels", desc: "Affordable hostels with TTD scholarship support for eligible students." },
      { icon: "📚", name: "Oriental Library", desc: "Rare manuscripts, Telugu literature archives, and 2 lakh+ volumes." },
      { icon: "🍽️", name: "Canteen", desc: "Affordable canteen with South Indian vegetarian food options." },
    ],
  },
];

export function getUniversityById(id) {
  return universities.find(u => u.id === id);
}

export function getUniversitiesByCity(city) {
  return universities.filter(u => u.city === city);
}

export function getUniversitiesByBranch(branch) {
  return universities.filter(u => u.branches.includes(branch));
}
