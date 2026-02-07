// Officers Page JavaScript Module
const OfficersModule = {
    async init() {
        console.log('Officers page initialized');
        
        // Initialize data
        await this.loadOfficersData();
        
        // Initialize components
        this.initCommitteeFilters();
        this.initMemberSearch();
        this.initPagination();
        this.setupProfileModals();
        this.setupExecutiveCards();
        
        // Load initial data
        this.loadCommittees();
        this.loadMembers();
    },

    async loadOfficersData() {
        try {
            // Try to load from localStorage first
            const savedData = localStorage.getItem('jpcs_officers_data');
            
            if (savedData) {
                this.officersData = JSON.parse(savedData);
            } else {
                // Load default data
                this.officersData = await this.getDefaultOfficersData();
                this.saveOfficersData();
            }
            
            // Load member data
            const savedMembers = localStorage.getItem('jpcs_members_data');
            if (savedMembers) {
                this.membersData = JSON.parse(savedMembers);
            } else {
                this.membersData = await this.getDefaultMembersData();
                localStorage.setItem('jpcs_members_data', JSON.stringify(this.membersData));
            }
            
        } catch (error) {
            console.error('Error loading officers data:', error);
            this.officersData = await this.getDefaultOfficersData();
            this.membersData = await this.getDefaultMembersData();
        }
    },

    async getDefaultOfficersData() {
        return {
            executives: [
                {
                    id: 1,
                    name: "Maria Santos",
                    position: "President",
                    major: "BS Computer Science, Senior",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=President",
                    bio: "Passionate about AI and machine learning. Leading JPCS to new heights with innovative projects and industry partnerships.",
                    email: "maria.santos@jpcs.org",
                    phone: "+63 912 345 6789",
                    skills: ["Leadership", "AI/ML", "Project Management", "Public Speaking"],
                    social: {
                        linkedin: "#",
                        github: "#",
                        twitter: "#"
                    }
                },
                {
                    id: 2,
                    name: "Juan Dela Cruz",
                    position: "Vice President",
                    major: "BS Information Technology, Senior",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=VicePresident",
                    bio: "Specializes in cybersecurity and network infrastructure. Coordinates all technical committees and workshops.",
                    email: "juan.delacruz@jpcs.org",
                    phone: "+63 912 345 6790",
                    skills: ["Cybersecurity", "Networking", "Team Management", "Event Planning"],
                    social: {
                        linkedin: "#",
                        github: "#",
                        twitter: "#"
                    }
                },
                {
                    id: 3,
                    name: "Sofia Reyes",
                    position: "Secretary",
                    major: "BS Computer Science, Junior",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Secretary",
                    bio: "Organizes meetings and maintains records. Passionate about documentation and process optimization.",
                    email: "sofia.reyes@jpcs.org",
                    phone: "+63 912 345 6791",
                    skills: ["Documentation", "Organization", "Communication", "Data Analysis"],
                    social: {
                        linkedin: "#",
                        github: "#",
                        twitter: "#"
                    }
                },
                {
                    id: 4,
                    name: "Miguel Torres",
                    position: "Treasurer",
                    major: "BS Information Systems, Senior",
                    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Treasurer",
                    bio: "Manages organization finances and budget planning. Focused on sustainable growth and resource allocation.",
                    email: "miguel.torres@jpcs.org",
                    phone: "+63 912 345 6792",
                    skills: ["Finance", "Budgeting", "Analytics", "Strategic Planning"],
                    social: {
                        linkedin: "#",
                        github: "#",
                        twitter: "#"
                    }
                }
            ],
            committees: [
                { id: 1, name: "Alex Johnson", position: "Tech Committee Head", committee: "tech", avatar: "TC" },
                { id: 2, name: "Bianca Lim", position: "Events Committee Head", committee: "events", avatar: "EC" },
                { id: 3, name: "Carlos Garcia", position: "Membership Committee Head", committee: "membership", avatar: "MC" },
                { id: 4, name: "Diana Chen", position: "Marketing Committee Head", committee: "marketing", avatar: "MR" },
                { id: 5, name: "Ethan Wong", position: "Research Head", committee: "tech", avatar: "RH" },
                { id: 6, name: "Fatima Ahmed", position: "Workshop Coordinator", committee: "events", avatar: "WC" },
                { id: 7, name: "Gabriel Lee", position: "Outreach Coordinator", committee: "membership", avatar: "OC" },
                { id: 8, name: "Hannah Park", position: "Social Media Manager", committee: "marketing", avatar: "SM" }
            ]
        };
    },

    async getDefaultMembersData() {
        const majors = [
            "BS Computer Science", 
            "BS Information Technology", 
            "BS Information Systems",
            "BS Computer Engineering",
            "BS Data Science"
        ];
        
        const skills = [
            "Python", "Java", "JavaScript", "React", "Node.js", "AI/ML",
            "Cybersecurity", "UI/UX", "Mobile Dev", "Cloud", "DevOps", "Data Analytics"
        ];
        
        const names = [
            "John Smith", "Emma Wilson", "Michael Brown", "Sarah Davis", "David Lee",
            "Lisa Garcia", "Kevin Chen", "Anna Kim", "Ryan Patel", "Megan Taylor",
            "Brian Wilson", "Sophia Martinez", "James Anderson", "Olivia Thomas",
            "Daniel Clark", "Emily Rodriguez", "Matthew Lewis", "Chloe Walker",
            "Andrew Hall", "Grace Allen"
        ];
        
        const members = [];
        
        for (let i = 0; i < 20; i++) {
            const name = names[i % names.length];
            const major = majors[Math.floor(Math.random() * majors.length)];
            const year = ["Freshman", "Sophomore", "Junior", "Senior"][Math.floor(Math.random() * 4)];
            
            // Generate random skills (2-4 skills per member)
            const memberSkills = [];
            const numSkills = Math.floor(Math.random() * 3) + 2;
            const availableSkills = [...skills];
            
            for (let j = 0; j < numSkills; j++) {
                if (availableSkills.length > 0) {
                    const skillIndex = Math.floor(Math.random() * availableSkills.length);
                    memberSkills.push(availableSkills.splice(skillIndex, 1)[0]);
                }
            }
            
            members.push({
                id: i + 1,
                name: name,
                major: major,
                year: year,
                skills: memberSkills,
                avatar: name.split(' ').map(n => n[0]).join('')
            });
        }
        
        return members;
    },

    saveOfficersData() {
        try {
            localStorage.setItem('jpcs_officers_data', JSON.stringify(this.officersData));
        } catch (error) {
            console.error('Error saving officers data:', error);
        }
    },

    initCommitteeFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Filter committees
                const committee = button.dataset.committee;
                this.filterCommittees(committee);
            });
        });
    },

    filterCommittees(committee) {
        const committeesGrid = document.querySelector('.committees-grid');
        const committees = this.officersData.committees;
        
        let filteredCommittees;
        if (committee === 'all') {
            filteredCommittees = committees;
        } else {
            filteredCommittees = committees.filter(c => c.committee === committee);
        }
        
        committeesGrid.innerHTML = filteredCommittees.map(committee => this.createCommitteeCard(committee)).join('');
        
        // Add hover effects to new cards
        this.setupCommitteeCardHovers();
    },

    createCommitteeCard(committee) {
        const committeeNames = {
            tech: "Tech & Innovation",
            events: "Events & Logistics",
            membership: "Membership & Outreach",
            marketing: "Marketing & PR"
        };
        
        return `
            <div class="committee-card" data-committee="${committee.committee}">
                <div class="committee-avatar" style="background: linear-gradient(45deg, var(--primary), var(--secondary));">
                    ${committee.avatar}
                </div>
                <div class="committee-details">
                    <h4>${committee.name}</h4>
                    <p>${committee.position}</p>
                    <span class="committee-name">${committeeNames[committee.committee] || committee.committee}</span>
                </div>
            </div>
        `;
    },

    loadCommittees() {
        const committeesGrid = document.querySelector('.committees-grid');
        if (committeesGrid && this.officersData?.committees) {
            committeesGrid.innerHTML = this.officersData.committees.map(committee => 
                this.createCommitteeCard(committee)
            ).join('');
            
            this.setupCommitteeCardHovers();
        }
    },

    setupCommitteeCardHovers() {
        document.querySelectorAll('.committee-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                const avatar = card.querySelector('.committee-avatar');
                if (avatar) {
                    avatar.style.transform = 'scale(1.1)';
                    avatar.style.boxShadow = '0 0 15px var(--primary)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                const avatar = card.querySelector('.committee-avatar');
                if (avatar) {
                    avatar.style.transform = 'scale(1)';
                    avatar.style.boxShadow = 'none';
                }
            });
        });
    },

    initMemberSearch() {
        const searchInput = document.getElementById('member-search');
        const sortSelect = document.getElementById('member-sort');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value.toLowerCase();
                this.currentPage = 1;
                this.loadMembers();
            });
        }
        
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.loadMembers();
            });
        }
    },

    initPagination() {
        this.currentPage = 1;
        this.itemsPerPage = 12;
        
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.loadMembers();
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(this.filteredMembers?.length / this.itemsPerPage) || 1;
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.loadMembers();
                }
            });
        }
    },

    loadMembers() {
        const membersGrid = document.querySelector('.members-grid');
        if (!membersGrid || !this.membersData) return;
        
        // Filter members based on search
        let filtered = this.membersData;
        
        if (this.currentSearch) {
            filtered = filtered.filter(member => 
                member.name.toLowerCase().includes(this.currentSearch) ||
                member.major.toLowerCase().includes(this.currentSearch) ||
                member.skills.some(skill => skill.toLowerCase().includes(this.currentSearch))
            );
        }
        
        // Sort members
        if (this.currentSort) {
            filtered.sort((a, b) => {
                switch (this.currentSort) {
                    case 'name-asc':
                        return a.name.localeCompare(b.name);
                    case 'name-desc':
                        return b.name.localeCompare(a.name);
                    case 'year-asc':
                        const yearOrder = { "Freshman": 1, "Sophomore": 2, "Junior": 3, "Senior": 4 };
                        return yearOrder[a.year] - yearOrder[b.year];
                    case 'year-desc':
                        const yearOrderDesc = { "Freshman": 1, "Sophomore": 2, "Junior": 3, "Senior": 4 };
                        return yearOrderDesc[b.year] - yearOrderDesc[a.year];
                    default:
                        return 0;
                }
            });
        }
        
        this.filteredMembers = filtered;
        
        // Calculate pagination
        const totalPages = Math.ceil(filtered.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedMembers = filtered.slice(startIndex, endIndex);
        
        // Render members
        membersGrid.innerHTML = paginatedMembers.map(member => this.createMemberCard(member)).join('');
        
        // Update pagination controls
        this.updatePaginationControls(totalPages);
        
        // Setup member card clicks
        this.setupMemberCardClicks();
    },

    createMemberCard(member) {
        return `
            <div class="member-card" data-member-id="${member.id}">
                <div class="member-avatar">
                    ${member.avatar}
                </div>
                <h4 class="member-name">${member.name}</h4>
                <p class="member-major">${member.major}</p>
                <p class="member-year">${member.year}</p>
                <div class="member-skills">
                    ${member.skills.slice(0, 3).map(skill => 
                        `<span class="skill-tag">${skill}</span>`
                    ).join('')}
                    ${member.skills.length > 3 ? 
                        `<span class="skill-tag">+${member.skills.length - 3}</span>` : ''
                    }
                </div>
            </div>
        `;
    },

    updatePaginationControls(totalPages) {
        const currentPageEl = document.getElementById('current-page');
        const totalPagesEl = document.getElementById('total-pages');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        if (currentPageEl) currentPageEl.textContent = this.currentPage;
        if (totalPagesEl) totalPagesEl.textContent = totalPages;
        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage === totalPages;
    },

    setupMemberCardClicks() {
        document.querySelectorAll('.member-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const memberId = parseInt(card.dataset.memberId);
                const member = this.membersData.find(m => m.id === memberId);
                
                if (member) {
                    this.showMemberModal(member);
                }
            });
        });
    },

    setupProfileModals() {
        const modal = document.getElementById('officer-modal');
        const closeBtn = modal.querySelector('.modal-close');
        
        // Close modal
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
            }
        });
    },

    setupExecutiveCards() {
        document.querySelectorAll('.view-profile-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.executive-card');
                const officerId = parseInt(card.dataset.officerId);
                const officer = this.officersData.executives.find(o => o.id === officerId);
                
                if (officer) {
                    this.showOfficerModal(officer);
                }
            });
        });
        
        // Also make executive cards clickable
        document.querySelectorAll('.executive-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.view-profile-btn') && !e.target.closest('.officer-social')) {
                    const officerId = parseInt(card.dataset.officerId);
                    const officer = this.officersData.executives.find(o => o.id === officerId);
                    
                    if (officer) {
                        this.showOfficerModal(officer);
                    }
                }
            });
        });
    },

    showOfficerModal(officer) {
        const modal = document.getElementById('officer-modal');
        const modalBody = modal.querySelector('.modal-body');
        
        modalBody.innerHTML = `
            <div class="profile-details">
                <div class="profile-image">
                    <img src="${officer.avatar}" alt="${officer.name}">
                    <div class="officer-social" style="justify-content: center; margin-top: 1rem;">
                        <a href="${officer.social.linkedin}" target="_blank"><i class="fab fa-linkedin"></i></a>
                        <a href="${officer.social.github}" target="_blank"><i class="fab fa-github"></i></a>
                        <a href="${officer.social.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>
                    </div>
                </div>
                <div class="profile-info">
                    <h2>${officer.name}</h2>
                    <p class="profile-title">${officer.position}</p>
                    <p class="profile-bio">${officer.bio}</p>
                    
                    <div class="profile-details-grid">
                        <div class="detail-item">
                            <div class="detail-label">Major & Year</div>
                            <div class="detail-value">${officer.major}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Email</div>
                            <div class="detail-value">${officer.email}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Phone</div>
                            <div class="detail-value">${officer.phone}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Role</div>
                            <div class="detail-value">Executive Board</div>
                        </div>
                    </div>
                    
                    <div class="profile-skills">
                        <h4>Skills & Expertise</h4>
                        <div class="skills-list">
                            ${officer.skills.map(skill => 
                                `<span class="skill-item">${skill}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
    },

    showMemberModal(member) {
        const modal = document.getElementById('officer-modal');
        const modalBody = modal.querySelector('.modal-body');
        
        modalBody.innerHTML = `
            <div class="profile-details">
                <div class="profile-image">
                    <div class="member-avatar" style="width: 200px; height: 200px; font-size: 4rem;">
                        ${member.avatar}
                    </div>
                </div>
                <div class="profile-info">
                    <h2>${member.name}</h2>
                    <p class="profile-title">Active Member</p>
                    <p class="profile-bio">Dedicated JPCS member passionate about technology and community involvement.</p>
                    
                    <div class="profile-details-grid">
                        <div class="detail-item">
                            <div class="detail-label">Major</div>
                            <div class="detail-value">${member.major}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Year Level</div>
                            <div class="detail-value">${member.year}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Member Since</div>
                            <div class="detail-value">2023</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Status</div>
                            <div class="detail-value">Active</div>
                        </div>
                    </div>
                    
                    <div class="profile-skills">
                        <h4>Technical Skills</h4>
                        <div class="skills-list">
                            ${member.skills.map(skill => 
                                `<span class="skill-item">${skill}</span>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="profile-skills" style="margin-top: 1.5rem;">
                        <h4>Participation</h4>
                        <div style="color: var(--gray); line-height: 1.6;">
                            <p><i class="fas fa-check-circle" style="color: var(--primary);"></i> Attended 15+ JPCS events</p>
                            <p><i class="fas fa-check-circle" style="color: var(--primary);"></i> Active in community projects</p>
                            <p><i class="fas fa-check-circle" style="color: var(--primary);"></i> Volunteer for tech workshops</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        modal.classList.add('active');
    }
};

// Export the module
export { OfficersModule as default };