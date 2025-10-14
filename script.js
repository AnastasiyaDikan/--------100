document.addEventListener('DOMContentLoaded', () => {
    // --- ЛОГИКА ДЛЯ СКЛОННОСТЕЙ (исправленная) ---
    const aptitudeItems = document.querySelectorAll('.aptitude-item');
    aptitudeItems.forEach(item => {
        const dots = item.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const isFilled = dot.classList.contains('filled');
                
                if (isFilled) {
                    dot.classList.remove('filled');
                } else {
                    dots.forEach((d, i) => {
                        if (i <= index) {
                            d.classList.add('filled');
                        } else {
                            d.classList.remove('filled');
                        }
                    });
                }
            });
        });
    });

    const saveButton = document.getElementById('save-button');
    const loadInput = document.getElementById('file-input');
    const notesButton = document.getElementById('notes-button');
    const notesModal = document.getElementById('notes-modal');
    const notesSave = document.getElementById('notes-save');
    const notesCancel = document.getElementById('notes-cancel');
    const campaignNotes = document.getElementById('campaign-notes');

    // --- АВАТАРКА ---
    const avatarPlaceholder = document.getElementById('avatar-placeholder');
    const avatarInput = document.getElementById('avatar-input');
    const avatarUploadBtn = document.getElementById('avatar-upload-btn');
    let avatarData = null;

    avatarUploadBtn.addEventListener('click', () => {
        avatarInput.click();
    });

    avatarInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarData = e.target.result;
                avatarPlaceholder.style.backgroundImage = `url(${avatarData})`;
                avatarPlaceholder.classList.add('has-image');
                avatarPlaceholder.querySelector('span').style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });

    // --- МОДАЛЬНОЕ ОКНО ЗАМЕТОК ---
    notesButton.addEventListener('click', () => {
        const savedNotes = localStorage.getItem('campaignNotes');
        if (savedNotes) {
            campaignNotes.value = savedNotes;
        }
        notesModal.style.display = 'block';
    });

    notesSave.addEventListener('click', () => {
        localStorage.setItem('campaignNotes', campaignNotes.value);
        notesModal.style.display = 'none';
    });

    notesCancel.addEventListener('click', () => {
        notesModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === notesModal) {
            notesModal.style.display = 'none';
        }
    });

    // --- СКРЫТИЕ/ПОКАЗ НАВЫКОВ ПО ХАРАКТЕРИСТИКАМ ---
    const skillHeaders = document.querySelectorAll('.skill-characteristic-header');
    skillHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const characteristic = header.getAttribute('data-characteristic');
            const skillGroup = document.getElementById(`skills-${characteristic}`);
            const toggleIcon = header.querySelector('.toggle-icon');
            
            if (skillGroup.style.display === 'none') {
                skillGroup.style.display = 'block';
                header.classList.add('active');
                toggleIcon.textContent = '▼';
            } else {
                skillGroup.style.display = 'none';
                header.classList.remove('active');
                toggleIcon.textContent = '▶';
            }
        });
    });

    // --- ДИНАМИЧЕСКОЕ ДОБАВЛЕНИЕ СТРОК ДЛЯ НАВЫКОВ ---
    const skillTypes = ['lore-common', 'lore-forbidden', 'linguistics', 'lore-scholastic', 'trade'];
    let currentRowToRemove = null;
    let currentSkillTypeToRemove = null;
    const confirmModal = document.getElementById('confirm-modal');
    const confirmYes = document.getElementById('confirm-yes');
    const confirmNo = document.getElementById('confirm-no');
    
    confirmYes.addEventListener('click', () => {
        if (currentRowToRemove && currentSkillTypeToRemove) {
            currentRowToRemove.remove();
            reindexSkillRows(currentSkillTypeToRemove);
            closeModal();
        }
    });
    
    confirmNo.addEventListener('click', closeModal);
    
    function closeModal() {
        confirmModal.style.display = 'none';
        currentRowToRemove = null;
        currentSkillTypeToRemove = null;
    }
    
    function addSkillRow(skillType, data = null) {
        const container = document.getElementById(`${skillType}-container`);
        const rowIndex = container.children.length + 1;
        const row = document.createElement('tr');
        row.className = 'skill-sub-row';
        row.innerHTML = `
            <td>
                <button type="button" class="remove-skill-btn" title="Удалить навык">×</button>
                <span class="skill-name dynamic-skill" data-skill="${skillType}-sub${rowIndex}">${getPlaceholder(skillType)}</span>
                <span class="skill-value" data-skill="${skillType}-sub${rowIndex}"></span>
            </td>
            <td><input type="checkbox" id="${skillType}-sub${rowIndex}-k" data-skill="${skillType}-sub${rowIndex}" data-level="1" data-characteristic="intelligence"></td>
            <td><input type="checkbox" id="${skillType}-sub${rowIndex}-10" data-skill="${skillType}-sub${rowIndex}" data-level="2" data-characteristic="intelligence"></td>
            <td><input type="checkbox" id="${skillType}-sub${rowIndex}-20" data-skill="${skillType}-sub${rowIndex}" data-level="3" data-characteristic="intelligence"></td>
            <td><input type="checkbox" id="${skillType}-sub${rowIndex}-30" data-skill="${skillType}-sub${rowIndex}" data-level="4" data-characteristic="intelligence"></td>
            <td><input type="checkbox" id="${skillType}-sub${rowIndex}-40" data-skill="${skillType}-sub${rowIndex}" data-level="5" data-characteristic="intelligence"></td>
        `;
        container.appendChild(row);

        if (data) {
            const nameSpan = row.querySelector('.skill-name');
            nameSpan.textContent = data.name || getPlaceholder(skillType);
            row.querySelector(`#${skillType}-sub${rowIndex}-k`).checked = data.k || false;
            row.querySelector(`#${skillType}-sub${rowIndex}-10`).checked = data.plus10 || false;
            row.querySelector(`#${skillType}-sub${rowIndex}-20`).checked = data.plus20 || false;
            row.querySelector(`#${skillType}-sub${rowIndex}-30`).checked = data.plus30 || false;
        }

        row.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', handleSkillCheckboxChange);
        });
        
        row.querySelector('.remove-skill-btn').addEventListener('click', () => {
            currentRowToRemove = row;
            currentSkillTypeToRemove = skillType;
            confirmModal.style.display = 'block';
        });

        const skillNameSpan = row.querySelector('.skill-name');
        skillNameSpan.addEventListener('click', handleSkillNameClick);
    }
    
    function getPlaceholder(skillType) {
        const placeholders = {
            'lore-common': 'Область знаний...', 'lore-forbidden': 'Область знаний...',
            'linguistics': 'Язык...', 'lore-scholastic': 'Область знаний...',
            'trade': 'Вид ремесла...'
        };
        return placeholders[skillType] || 'Название...';
    }

    function reindexSkillRows(skillType) {
        const container = document.getElementById(`${skillType}-container`);
        const rows = container.querySelectorAll('.skill-sub-row');
        
        rows.forEach((row, index) => {
            const newIndex = index + 1;
            const nameSpan = row.querySelector('.skill-name');
            const valueSpan = row.querySelector('.skill-value');
            const checkboxes = row.querySelectorAll('input[type="checkbox"]');
            
            nameSpan.dataset.skill = `${skillType}-sub${newIndex}`;
            valueSpan.dataset.skill = `${skillType}-sub${newIndex}`;
            
            checkboxes[0].id = `${skillType}-sub${newIndex}-k`;
            checkboxes[1].id = `${skillType}-sub${newIndex}-10`;
            checkboxes[2].id = `${skillType}-sub${newIndex}-20`;
            checkboxes[3].id = `${skillType}-sub${newIndex}-30`;
            
            checkboxes.forEach(checkbox => checkbox.dataset.skill = `${skillType}-sub${newIndex}`);
        });
    }
    
    document.querySelectorAll('.add-skill-btn').forEach(button => {
        button.addEventListener('click', () => {
            addSkillRow(button.getAttribute('data-skill-type'));
        });
    });
    
    skillTypes.forEach(skillType => addSkillRow(skillType));

    // --- РЕДАКТИРОВАНИЕ НАЗВАНИЙ НАВЫКОВ ---
    function handleSkillNameClick(event) {
        const span = event.target;
        const isPlaceholder = Object.values(getPlaceholders()).includes(span.textContent);

        // Если это не placeholder, то показываем значение. Иначе - редактируем.
        if (!isPlaceholder) {
            toggleSkillValueDisplay(event);
        } else {
            makeSkillNameEditable(span);
        }
    }

    function makeSkillNameEditable(span) {
        const currentText = span.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'skill-name-input';

        span.replaceWith(input);
        input.focus();

        const save = () => {
            const skillType = input.closest('.sub-skills-container').id.replace('-container', '');
            const newText = input.value.trim() || getPlaceholder(skillType);
            const newSpan = document.createElement('span');
            newSpan.className = 'skill-name dynamic-skill';
            newSpan.textContent = newText;
            newSpan.dataset.skill = span.dataset.skill;
            
            input.replaceWith(newSpan);
            newSpan.addEventListener('click', handleSkillNameClick); // Re-add generalized handler
        };

        input.addEventListener('blur', save);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                save();
            }
        });
    }

    function getPlaceholders() {
        return {
            'lore-common': 'Область знаний...', 'lore-forbidden': 'Область знаний...',
            'linguistics': 'Язык...', 'lore-scholastic': 'Область знаний...',
            'trade': 'Вид ремесла...'
        };
    }

    // --- СОЮЗНИКИ И ВРАГИ ---
    const alliesContainer = document.getElementById('allies-container');
    const enemiesContainer = document.getElementById('enemies-container');

    function addRelationship(type, data = null) {
        const container = type === 'allies' ? alliesContainer : enemiesContainer;
        const relationshipItem = document.createElement('div');
        relationshipItem.className = 'relationship-item';
        relationshipItem.innerHTML = `
            <input type="text" placeholder="Имя" value="${data ? data.name || '' : ''}">
            <input type="text" placeholder="Отношение" value="${data ? data.relation || '' : ''}">
            <input type="text" placeholder="Информация" value="${data ? data.info || '' : ''}">
            <button type="button" class="remove-relationship-btn" title="Удалить">×</button>
        `;
        container.appendChild(relationshipItem);
        relationshipItem.querySelector('.remove-relationship-btn').addEventListener('click', () => relationshipItem.remove());
    }

    document.querySelectorAll('.add-relationship-btn').forEach(button => {
        button.addEventListener('click', () => addRelationship(button.getAttribute('data-type')));
    });

    addRelationship('allies');
    addRelationship('enemies');

    // --- СКРЫТИЕ/ПОКАЗ СЕКЦИЙ ---
    document.querySelectorAll('.section-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const toggleIcon = header.querySelector('.toggle-icon');
            if (content.style.display === 'none') {
                content.style.display = 'block';
                header.classList.add('active');
                toggleIcon.textContent = '▼';
            } else {
                content.style.display = 'none';
                header.classList.remove('active');
                toggleIcon.textContent = '▶';
            }
        });
    });
    
    // --- БЕЗУМИЕ И ПОРЧА ---
    const mutationsContainer = document.getElementById('mutations-container');
    const corruptionsContainer = document.getElementById('corruptions-container');

    function addMutation(data = null) {
        const item = document.createElement('div');
        item.className = 'mutation-item';
        item.innerHTML = `<input type="text" placeholder="Название мутации" value="${data ? data.name || '' : ''}"><input type="text" placeholder="Описание мутации" value="${data ? data.description || '' : ''}"><button type="button" class="remove-mutation-btn" title="Удалить мутацию">×</button>`;
        mutationsContainer.appendChild(item);
        item.querySelector('.remove-mutation-btn').addEventListener('click', () => item.remove());
    }
    function addCorruption(data = null) {
        const item = document.createElement('div');
        item.className = 'corruption-item';
        item.innerHTML = `<input type="text" placeholder="Название проявления" value="${data ? data.name || '' : ''}"><input type="text" placeholder="Описание проявления" value="${data ? data.description || '' : ''}"><button type="button" class="remove-corruption-btn" title="Удалить проявление">×</button>`;
        corruptionsContainer.appendChild(item);
        item.querySelector('.remove-corruption-btn').addEventListener('click', () => item.remove());
    }

    document.querySelector('.add-mutation-btn').addEventListener('click', () => addMutation());
    document.querySelector('.add-corruption-btn').addEventListener('click', () => addCorruption());
    addMutation();
    addCorruption();

    // --- КОНСТАНТЫ И КАРТЫ ---
    const improvementCosts = { 0: [500, 1000, 2000, 4000, 8000], 1: [250, 500, 1000, 2000, 4000], 2: [100, 200, 400, 800, 1600] };
    const characteristicToAptitudeMap = { 'agility': 'ag', 'strength': 's', 'perception': 'per', 'fellowship': 'fel', 'intelligence': 'int', 'willpower': 'wp' };

    // --- РАСЧЕТ ЗНАЧЕНИЙ НАВЫКОВ ---
    function calculateSkillValue(skillName) {
        const checkboxes = document.querySelectorAll(`input[type="checkbox"][data-skill="${skillName}"]`);
        let skillBonus = -20;
        if (checkboxes[0].checked) skillBonus = 0;
        if (checkboxes[1].checked) skillBonus = 10;
        if (checkboxes[2].checked) skillBonus = 20;
        if (checkboxes[3].checked) skillBonus = 30;
        if (checkboxes[4].checked) skillBonus = 40;
        
        const characteristic = checkboxes[0].dataset.characteristic;
        const charValue = parseInt(document.getElementById(`stat-${characteristic}`).value) || 0;
        return charValue + skillBonus;
    }

    function toggleSkillValueDisplay(event) {
        const skillName = event.target.dataset.skill;
        const valueElement = document.querySelector(`.skill-value[data-skill="${skillName}"]`);
        
        if (valueElement.classList.contains('visible')) {
            valueElement.classList.remove('visible');
        } else {
            valueElement.textContent = calculateSkillValue(skillName);
            valueElement.classList.add('visible');
        }
    }
    
    document.querySelectorAll('.skill-name:not(.dynamic-skill)').forEach(skillName => {
        skillName.addEventListener('click', toggleSkillValueDisplay);
    });

    // --- УЛУЧШЕНИЕ ХАРАКТЕРИСТИК ---
    document.querySelectorAll('.improvement-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const isFilled = dot.classList.contains('filled');
            const statName = dot.dataset.stat;
            const level = parseInt(dot.dataset.value);
            const statInput = document.getElementById(`stat-${statName}`);
            
            const aptitudeKey = characteristicToAptitudeMap[statName];
            const aptitudeItem = document.querySelector(`.aptitude-item[data-aptitude="${aptitudeKey}"]`);
            const aptitudeCount = aptitudeItem ? aptitudeItem.querySelectorAll('.dot.filled').length : 0;
            const cost = improvementCosts[aptitudeCount][level - 1];
            
            if (!isFilled) {
                if (canSpendExperience(cost)) {
                    spendExperience(cost);
                    dot.classList.add('filled');
                    statInput.value = (parseInt(statInput.value) || 0) + 5;
                } else {
                    alert('Недостаточно опыта для улучшения!');
                }
            } else {
                dot.classList.remove('filled');
            }
        });
    });

    // --- СИСТЕМА ОПЫТА ---
    const currentExpInput = document.getElementById('current-exp');
    const usedExpInput = document.getElementById('used-exp');
    const totalExpInput = document.getElementById('total-exp');
    
    function canSpendExperience(cost = 0) { return (parseInt(currentExpInput.value) || 0) >= cost; }
    function spendExperience(cost = 0) {
        const currentExp = parseInt(currentExpInput.value) || 0;
        if (cost > 0 && currentExp >= cost) {
            currentExpInput.value = currentExp - cost;
            usedExpInput.value = (parseInt(usedExpInput.value) || 0) + cost;
            updateTotalExperience();
            return true;
        }
        return false;
    }
    function updateTotalExperience() {
        totalExpInput.value = (parseInt(currentExpInput.value) || 0) + (parseInt(usedExpInput.value) || 0);
    }
    
    currentExpInput.addEventListener('input', updateTotalExperience);
    usedExpInput.addEventListener('input', updateTotalExperience);
    totalExpInput.addEventListener('input', () => {
        currentExpInput.value = (parseInt(totalExpInput.value) || 0) - (parseInt(usedExpInput.value) || 0);
    });

    // --- ЛОГИКА ДЛЯ ЧЕКБОКСОВ НАВЫКОВ ---
    function handleSkillCheckboxChange(event) {
        const checkbox = event.target;
        const skillName = checkbox.dataset.skill;
        const level = parseInt(checkbox.dataset.level);
        const characteristic = checkbox.dataset.characteristic;
        
        const aptitudeKey = characteristicToAptitudeMap[characteristic];
        const aptitudeItem = document.querySelector(`.aptitude-item[data-aptitude="${aptitudeKey}"]`);
        const aptitudeCount = aptitudeItem ? aptitudeItem.querySelectorAll('.dot.filled').length : 0;
        const cost = improvementCosts[aptitudeCount][level - 1];
        
        if (checkbox.checked) {
            if (!canSpendExperience(cost)) {
                checkbox.checked = false;
                alert('Недостаточно опыта для улучшения навыка!');
            } else {
                spendExperience(cost);
            }
        }
        
        const valueElement = document.querySelector(`.skill-value[data-skill="${skillName}"]`);
        if (valueElement.classList.contains('visible')) {
            valueElement.textContent = calculateSkillValue(skillName);
        }
    }
    
    document.querySelectorAll('.skills-table input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleSkillCheckboxChange);
    });

    // --- ОЧКИ СУДЬБЫ ---
    const fateMaxInput = document.getElementById('fate-max');
    const fateCurrentInput = document.getElementById('fate-current');
    
    document.getElementById('fate-increase').addEventListener('click', () => {
        const current = parseInt(fateCurrentInput.value) || 0;
        const max = parseInt(fateMaxInput.value) || 3;
        if (current < max) fateCurrentInput.value = current + 1;
    });
    document.getElementById('fate-decrease').addEventListener('click', () => {
        const current = parseInt(fateCurrentInput.value) || 0;
        if (current > 0) fateCurrentInput.value = current - 1;
    });
    fateMaxInput.addEventListener('change', () => {
        if (parseInt(fateCurrentInput.value) > parseInt(fateMaxInput.value)) {
            fateCurrentInput.value = fateMaxInput.value;
        }
    });

    // --- ПРОРЫВЫ БЕЗДНЫ ---
    const abyssBreakthroughContainer = document.getElementById('abyss-breakthrough-container');
    function arabicToRoman(num) {
        const roman = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
        let str = '';
        for (let i of Object.keys(roman)) {
            let q = Math.floor(num / roman[i]);
            num -= q * roman[i];
            str += i.repeat(q);
        }
        return str;
    }
    function addAbyssBreakthrough(data = null) {
        const item = document.createElement('div');
        item.className = 'breakthrough-item';
        const romanValue = arabicToRoman(abyssBreakthroughContainer.children.length + 1);
        item.innerHTML = `<div class="breakthrough-value">${romanValue}</div><div class="breakthrough-description"><input type="text" placeholder="Описание прорыва" value="${data ? data.description || '' : ''}"></div><button type="button" class="remove-breakthrough-btn" title="Удалить прорыв">×</button>`;
        abyssBreakthroughContainer.appendChild(item);
        item.querySelector('.remove-breakthrough-btn').addEventListener('click', () => {
            item.remove();
            updateBreakthroughNumbers();
        });
    }
    function updateBreakthroughNumbers() {
        abyssBreakthroughContainer.querySelectorAll('.breakthrough-item').forEach((item, index) => {
            item.querySelector('.breakthrough-value').textContent = arabicToRoman(index + 1);
        });
    }
    document.querySelector('.add-breakthrough-btn').addEventListener('click', () => addAbyssBreakthrough());
    addAbyssBreakthrough();

    // --- СОХРАНЕНИЕ И ЗАГРУЗКА ---
    function getFormData() {
        const data = {
            inputs: {}, checkboxes: {}, aptitudes: {}, dynamicSkills: {}, improvements: {},
            experience: { current: currentExpInput.value, used: usedExpInput.value, total: totalExpInput.value },
            basicInfo: { name: document.getElementById('char-name').value, race: document.getElementById('char-race').value, background: document.getElementById('char-background').value, role: document.getElementById('char-role').value, age: document.getElementById('char-age').value, gender: document.getElementById('char-gender').value },
            appearance: { skin: document.getElementById('char-skin').value, eyes: document.getElementById('char-eyes').value, hair: document.getElementById('char-hair').value, build: document.getElementById('char-build').value },
            relationships: {
                allies: Array.from(alliesContainer.querySelectorAll('.relationship-item')).map(item => ({ name: item.children[0].value, relation: item.children[1].value, info: item.children[2].value })),
                enemies: Array.from(enemiesContainer.querySelectorAll('.relationship-item')).map(item => ({ name: item.children[0].value, relation: item.children[1].value, info: item.children[2].value }))
            },
            avatar: avatarData,
            campaignNotes: localStorage.getItem('campaignNotes') || '',
            fatePoints: { current: parseInt(fateCurrentInput.value) || 3, max: parseInt(fateMaxInput.value) || 3 },
            abyssPoints: parseInt(document.getElementById('abyss-points').value) || 0,
            abyssBreakthroughs: Array.from(abyssBreakthroughContainer.querySelectorAll('.breakthrough-item')).map(item => ({ description: item.querySelector('input').value })),
            madness: {
                points: document.getElementById('madness-points').value || 0,
                mutations: Array.from(mutationsContainer.querySelectorAll('.mutation-item')).map(item => ({ name: item.children[0].value, description: item.children[1].value }))
            },
            corruption: {
                points: document.getElementById('corruption-points').value || 0,
                corruptions: Array.from(corruptionsContainer.querySelectorAll('.corruption-item')).map(item => ({ name: item.children[0].value, description: item.children[1].value }))
            }
        };

        document.querySelectorAll('input[type="text"]:not([class^="skill-name-input"]), input[type="number"]').forEach(input => {
            if (!input.closest('.relationship-item, .mutation-item, .corruption-item, .breakthrough-item') && !['fate-current', 'fate-max', 'abyss-points'].includes(input.id)) {
                data.inputs[input.id] = input.value;
            }
        });
        document.querySelectorAll('.skills-table input[type="checkbox"]:not([id*="-sub"])').forEach(cb => data.checkboxes[cb.id] = cb.checked);
        document.querySelectorAll('.aptitude-item').forEach(item => data.aptitudes[item.dataset.aptitude] = item.querySelectorAll('.dot.filled').length);
        skillTypes.forEach(type => {
            data.dynamicSkills[type] = Array.from(document.getElementById(`${type}-container`).querySelectorAll('.skill-sub-row')).map(row => ({
                name: row.querySelector('.skill-name').textContent,
                k: row.querySelector('[data-level="1"]').checked,
                plus10: row.querySelector('[data-level="2"]').checked,
                plus20: row.querySelector('[data-level="3"]').checked,
                plus30: row.querySelector('[data-level="4"]').checked,
                plus40: row.querySelector('[data-level="5"]').checked
            }));
        });
        document.querySelectorAll('.stat-item').forEach(item => data.improvements[item.querySelector('input').id.replace('stat-', '')] = item.querySelectorAll('.improvement-dot.filled').length);
        
        return data;
    }

    function setFormData(data) {
        if (data.inputs) for (const id in data.inputs) if (document.getElementById(id)) document.getElementById(id).value = data.inputs[id];
        if (data.checkboxes) for (const id in data.checkboxes) if (document.getElementById(id)) document.getElementById(id).checked = data.checkboxes[id];
        if (data.aptitudes) for (const name in data.aptitudes) {
            const item = document.querySelector(`.aptitude-item[data-aptitude="${name}"]`);
            if (item) item.querySelectorAll('.dot').forEach((dot, i) => dot.classList.toggle('filled', i < data.aptitudes[name]));
        }
        if (data.dynamicSkills) skillTypes.forEach(type => {
            const container = document.getElementById(`${type}-container`);
            container.innerHTML = '';
            if (data.dynamicSkills[type] && data.dynamicSkills[type].length > 0) {
                data.dynamicSkills[type].forEach(skillData => addSkillRow(type, skillData));
            } else {
                addSkillRow(type);
            }
        });
        if (data.improvements) for (const name in data.improvements) {
            const item = document.querySelector(`#stat-${name}`).closest('.stat-item');
            if(item) item.querySelectorAll('.improvement-dot').forEach((dot, i) => dot.classList.toggle('filled', i < data.improvements[name]));
        }
        if (data.experience) {
            currentExpInput.value = data.experience.current || 0;
            usedExpInput.value = data.experience.used || 0;
            totalExpInput.value = data.experience.total || 0;
        }
        if (data.basicInfo) Object.keys(data.basicInfo).forEach(key => document.getElementById(`char-${key}`).value = data.basicInfo[key] || '');
        if (data.appearance) Object.keys(data.appearance).forEach(key => document.getElementById(`char-${key}`).value = data.appearance[key] || '');
        if (data.relationships) {
            alliesContainer.innerHTML = ''; enemiesContainer.innerHTML = '';
            data.relationships.allies.forEach(ally => addRelationship('allies', ally));
            data.relationships.enemies.forEach(enemy => addRelationship('enemies', enemy));
            if (alliesContainer.children.length === 0) addRelationship('allies');
            if (enemiesContainer.children.length === 0) addRelationship('enemies');
        }
        if (data.avatar) {
            avatarData = data.avatar;
            avatarPlaceholder.style.backgroundImage = `url(${data.avatar})`;
            avatarPlaceholder.classList.add('has-image');
            avatarPlaceholder.querySelector('span').style.display = 'none';
        }
        if (data.campaignNotes) localStorage.setItem('campaignNotes', data.campaignNotes);
        if (data.fatePoints) { fateMaxInput.value = data.fatePoints.max || 3; fateCurrentInput.value = data.fatePoints.current || 3; }
        if (data.abyssPoints !== undefined) document.getElementById('abyss-points').value = data.abyssPoints || 0;
        if (data.abyssBreakthroughs) {
            abyssBreakthroughContainer.innerHTML = '';
            data.abyssBreakthroughs.forEach(b => addAbyssBreakthrough(b));
        }
        if (data.madness) {
            document.getElementById('madness-points').value = data.madness.points || 0;
            mutationsContainer.innerHTML = '';
            data.madness.mutations.forEach(m => addMutation(m));
            if(mutationsContainer.children.length === 0) addMutation();
        }
        if (data.corruption) {
            document.getElementById('corruption-points').value = data.corruption.points || 0;
            corruptionsContainer.innerHTML = '';
            data.corruption.corruptions.forEach(c => addCorruption(c));
            if(corruptionsContainer.children.length === 0) addCorruption();
        }
    }
    
    saveButton.addEventListener('click', () => {
        const data = getFormData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const charName = (document.getElementById('char-name').value.trim() || 'character').replace(/[^a-z0-9]/gi, '_');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${charName}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    });

    loadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    setFormData(JSON.parse(e.target.result));
                } catch (error) {
                    console.error("Ошибка чтения файла:", error);
                    alert('Ошибка при чтении файла.');
                }
            };
            reader.readAsText(file);
            loadInput.value = '';
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === confirmModal) closeModal();
    });
});