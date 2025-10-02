document.addEventListener('DOMContentLoaded', () => {
    // --- ЛОГИКА ДЛЯ СКЛОННОСТЕЙ (исправленная) ---
    const aptitudeItems = document.querySelectorAll('.aptitude-item');
    aptitudeItems.forEach(item => {
        const dots = item.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                const isFilled = dot.classList.contains('filled');
                
                if (isFilled) {
                    // Убираем только этот кружочек
                    dot.classList.remove('filled');
                } else {
                    // Заполняем все до этого кружочка включительно
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

    // --- ДИНАМИЧЕСКОЕ ДОБАВЛЕНИЕ СТРОК ДЛЯ НАВЫКОВ ---
    const skillTypes = ['lore-common', 'lore-forbidden', 'linguistics', 'lore-scholastic', 'trade'];
    
    // Переменные для управления модальным окном удаления
    let currentRowToRemove = null;
    let currentSkillTypeToRemove = null;
    const confirmModal = document.getElementById('confirm-modal');
    const confirmYes = document.getElementById('confirm-yes');
    const confirmNo = document.getElementById('confirm-no');
    
    // Настройка модального окна подтверждения
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
    
    // Функция добавления новой строки навыка
    function addSkillRow(skillType, data = null) {
        const container = document.getElementById(`${skillType}-container`);
        const rowIndex = container.children.length + 1;
        
        const row = document.createElement('tr');
        row.className = 'skill-sub-row';
        row.innerHTML = `
            <td>
                <button type="button" class="remove-skill-btn" title="Удалить навык">×</button>
                <input type="text" id="${skillType}-sub${rowIndex}-name" placeholder="${getPlaceholder(skillType)}">
            </td>
            <td><input type="checkbox" id="${skillType}-sub${rowIndex}-k" data-skill="${skillType}-sub${rowIndex}" data-level="1" data-characteristic="intelligence"></td>
            <td><input type="checkbox" id="${skillType}-sub${rowIndex}-10" data-skill="${skillType}-sub${rowIndex}" data-level="2" data-characteristic="intelligence"></td>
            <td><input type="checkbox" id="${skillType}-sub${rowIndex}-20" data-skill="${skillType}-sub${rowIndex}" data-level="3" data-characteristic="intelligence"></td>
            <td><input type="checkbox" id="${skillType}-sub${rowIndex}-30" data-skill="${skillType}-sub${rowIndex}" data-level="4" data-characteristic="intelligence"></td>
        `;
        
        container.appendChild(row);
        
        // Заполняем данными, если они переданы
        if (data) {
            document.getElementById(`${skillType}-sub${rowIndex}-name`).value = data.name || '';
            document.getElementById(`${skillType}-sub${rowIndex}-k`).checked = data.k || false;
            document.getElementById(`${skillType}-sub${rowIndex}-10`).checked = data.plus10 || false;
            document.getElementById(`${skillType}-sub${rowIndex}-20`).checked = data.plus20 || false;
            document.getElementById(`${skillType}-sub${rowIndex}-30`).checked = data.plus30 || false;
        }
        
        // Добавляем обработчики для чекбоксов динамических навыков
        const checkboxes = row.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleSkillCheckboxChange);
        });
        
        // Добавляем обработчик для кнопки удаления
        row.querySelector('.remove-skill-btn').addEventListener('click', () => {
            currentRowToRemove = row;
            currentSkillTypeToRemove = skillType;
            confirmModal.style.display = 'block';
        });
    }
    
    // Функция для получения placeholder в зависимости от типа навыка
    function getPlaceholder(skillType) {
        const placeholders = {
            'lore-common': 'Область знаний...',
            'lore-forbidden': 'Область знаний...',
            'linguistics': 'Язык...',
            'lore-scholastic': 'Область знаний...',
            'trade': 'Вид ремесла...'
        };
        return placeholders[skillType] || 'Название...';
    }
    
    // Функция переиндексации строк после удаления
    function reindexSkillRows(skillType) {
        const container = document.getElementById(`${skillType}-container`);
        const rows = container.querySelectorAll('.skill-sub-row');
        
        rows.forEach((row, index) => {
            const newIndex = index + 1;
            const nameInput = row.querySelector('input[type="text"]');
            const checkboxes = row.querySelectorAll('input[type="checkbox"]');
            
            // Обновляем ID
            nameInput.id = `${skillType}-sub${newIndex}-name`;
            checkboxes[0].id = `${skillType}-sub${newIndex}-k`;
            checkboxes[1].id = `${skillType}-sub${newIndex}-10`;
            checkboxes[2].id = `${skillType}-sub${newIndex}-20`;
            checkboxes[3].id = `${skillType}-sub${newIndex}-30`;
            
            // Обновляем data-атрибуты
            checkboxes.forEach((checkbox, i) => {
                checkbox.dataset.skill = `${skillType}-sub${newIndex}`;
            });
        });
    }
    
    // Добавляем обработчики для кнопок "Добавить"
    document.querySelectorAll('.add-skill-btn').forEach(button => {
        button.addEventListener('click', () => {
            const skillType = button.getAttribute('data-skill-type');
            addSkillRow(skillType);
        });
    });
    
    // Добавляем по одной пустой строке для каждого типа навыков при загрузке
    skillTypes.forEach(skillType => {
        addSkillRow(skillType);
    });

    // --- ТАБЛИЦА СТОИМОСТИ УЛУЧШЕНИЙ ---
    const improvementCosts = {
        0: [500, 1000, 2000, 4000, 8000],    // 0 склонностей
        1: [250, 500, 1000, 2000, 4000],     // 1 склонность
        2: [100, 200, 400, 800, 1600]        // 2 склонности
    };

    // --- МАППИНГ ХАРАКТЕРИСТИК ДЛЯ СКЛОННОСТЕЙ ---
    const characteristicToAptitudeMap = {
        'agility': 'ag',
        'strength': 's',
        'perception': 'per',
        'fellowship': 'fel',
        'intelligence': 'int',
        'willpower': 'wp'
    };

    // --- СИСТЕМА УЛУЧШЕНИЯ ХАРАКТЕРИСТИК ---
    const improvementDots = document.querySelectorAll('.improvement-dot');
    
    improvementDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const isFilled = dot.classList.contains('filled');
            const statName = dot.dataset.stat;
            const improvementLevel = parseInt(dot.dataset.value);
            const statInput = document.getElementById(`stat-${statName}`);
            
            // Получаем количество склонностей для этой характеристики
            const aptitudeKey = characteristicToAptitudeMap[statName];
            const aptitudeItem = document.querySelector(`.aptitude-item[data-aptitude="${aptitudeKey}"]`);
            const aptitudeCount = aptitudeItem ? aptitudeItem.querySelectorAll('.dot.filled').length : 0;
            
            // Получаем стоимость улучшения
            const cost = improvementCosts[aptitudeCount][improvementLevel - 1];
            
            if (!isFilled) {
                // Пытаемся добавить улучшение
                if (updateExperience(cost)) {
                    dot.classList.add('filled');
                    const currentValue = parseInt(statInput.value) || 0;
                    statInput.value = currentValue + 5;
                }
            } else {
                // Убираем улучшение (НЕ возвращаем опыт)
                dot.classList.remove('filled');
                // Характеристику не уменьшаем, как требовалось
            }
        });
    });

    // --- СИСТЕМА ОПЫТА С ВОЗМОЖНОСТЬЮ РЕДАКТИРОВАНИЯ ---
    const currentExpInput = document.getElementById('current-exp');
    const usedExpInput = document.getElementById('used-exp');
    const totalExpInput = document.getElementById('total-exp');
    
    // Функция обновления опыта при покупке улучшений
    function updateExperience(cost = 0) {
        const currentExp = parseInt(currentExpInput.value) || 0;
        const usedExp = parseInt(usedExpInput.value) || 0;
        
        if (cost > 0) {
            // Тратим опыт
            if (currentExp >= cost) {
                currentExpInput.value = currentExp - cost;
                usedExpInput.value = usedExp + cost;
                updateTotalExperience();
                return true;
            } else {
                alert('Недостаточно опыта для улучшения!');
                return false;
            }
        }
        return true;
    }
    
    // Функция обновления общего опыта
    function updateTotalExperience() {
        const currentExp = parseInt(currentExpInput.value) || 0;
        const usedExp = parseInt(usedExpInput.value) || 0;
        totalExpInput.value = currentExp + usedExp;
    }
    
    // Обновляем общий опыт при изменении текущего опыта
    currentExpInput.addEventListener('input', updateTotalExperience);
    
    // Обновляем общий опыт при изменении использованного опыта
    usedExpInput.addEventListener('input', updateTotalExperience);
    
    // Обновляем текущий опыт при изменении общего опыта
    totalExpInput.addEventListener('input', () => {
        const totalExp = parseInt(totalExpInput.value) || 0;
        const usedExp = parseInt(usedExpInput.value) || 0;
        currentExpInput.value = totalExp - usedExp;
    });

    // --- ЛОГИКА ДЛЯ НАВЫКОВ ---
    function handleSkillCheckboxChange(event) {
        const checkbox = event.target;
        const isChecked = checkbox.checked;
        const skillName = checkbox.dataset.skill;
        const level = parseInt(checkbox.dataset.level);
        const characteristic = checkbox.dataset.characteristic;
        
        // Получаем количество склонностей для этой характеристики
        const aptitudeKey = characteristicToAptitudeMap[characteristic];
        const aptitudeItem = document.querySelector(`.aptitude-item[data-aptitude="${aptitudeKey}"]`);
        const aptitudeCount = aptitudeItem ? aptitudeItem.querySelectorAll('.dot.filled').length : 0;
        
        // Получаем стоимость улучшения
        const cost = improvementCosts[aptitudeCount][level - 1];
        
        if (isChecked) {
            // Пытаемся добавить улучшение навыка
            if (updateExperience(cost)) {
                // Галочка ставится автоматически благодаря checked свойству
            } else {
                // Если не хватило опыта, отменяем установку галочки
                checkbox.checked = false;
            }
        } else {
            // Убираем улучшение навыка (НЕ возвращаем опыт)
            // Галочка снимается, но опыт не возвращается
        }
    }
    
    // Добавляем обработчики для всех чекбоксов навыков
    document.querySelectorAll('.skills-table input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleSkillCheckboxChange);
    });

    // --- ФУНКЦИЯ СБОРА ДАННЫХ ---
    function getFormData() {
        const data = {
            inputs: {},
            checkboxes: {},
            aptitudes: {},
            dynamicSkills: {},
            improvements: {},
            experience: {}
        };
        
        // Статические текстовые поля
        document.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
            // Пропускаем динамические поля (они собираются отдельно)
            if (!input.id.includes('-sub')) {
                data.inputs[input.id] = input.value;
            }
        });
        
        // Статические чекбоксы
        document.querySelectorAll('.skills-table input[type="checkbox"]').forEach(checkbox => {
            // Пропускаем динамические чекбоксы
            if (!checkbox.id.includes('-sub')) {
                data.checkboxes[checkbox.id] = checkbox.checked;
            }
        });
        
        // Склонности
        document.querySelectorAll('.aptitude-item').forEach(item => {
            const aptitudeName = item.dataset.aptitude;
            const filledCount = item.querySelectorAll('.dot.filled').length;
            data.aptitudes[aptitudeName] = filledCount;
        });
        
        // Динамические навыки
        skillTypes.forEach(skillType => {
            data.dynamicSkills[skillType] = [];
            const container = document.getElementById(`${skillType}-container`);
            const rows = container.querySelectorAll('.skill-sub-row');
            
            rows.forEach((row, index) => {
                const rowIndex = index + 1;
                const nameElem = document.getElementById(`${skillType}-sub${rowIndex}-name`);
                const kElem = document.getElementById(`${skillType}-sub${rowIndex}-k`);
                const plus10Elem = document.getElementById(`${skillType}-sub${rowIndex}-10`);
                const plus20Elem = document.getElementById(`${skillType}-sub${rowIndex}-20`);
                const plus30Elem = document.getElementById(`${skillType}-sub${rowIndex}-30`);
                
                if (nameElem && kElem && plus10Elem && plus20Elem && plus30Elem) {
                    data.dynamicSkills[skillType].push({
                        name: nameElem.value,
                        k: kElem.checked,
                        plus10: plus10Elem.checked,
                        plus20: plus20Elem.checked,
                        plus30: plus30Elem.checked
                    });
                }
            });
        });
        
        // Улучшения характеристик
        document.querySelectorAll('.stat-item').forEach(item => {
            const statInput = item.querySelector('input[type="number"]');
            const statName = statInput.id.replace('stat-', '');
            const filledCount = item.querySelectorAll('.improvement-dot.filled').length;
            data.improvements[statName] = filledCount;
        });
        
        // Опыт
        data.experience = {
            current: currentExpInput.value,
            used: usedExpInput.value,
            total: totalExpInput.value
        };
        
        return data;
    }

    // --- ФУНКЦИЯ ЗАПОЛНЕНИЯ ДАННЫМИ ---
    function setFormData(data) {
        // Статические inputs
        if (data.inputs) {
            for (const id in data.inputs) {
                const element = document.getElementById(id);
                if (element) element.value = data.inputs[id];
            }
        }
        
        // Статические checkboxes
        if (data.checkboxes) {
            for (const id in data.checkboxes) {
                const element = document.getElementById(id);
                if (element) element.checked = data.checkboxes[id];
            }
        }
        
        // Склонности
        if (data.aptitudes) {
            for (const aptitudeName in data.aptitudes) {
                const item = document.querySelector(`.aptitude-item[data-aptitude="${aptitudeName}"]`);
                if (item) {
                    const dots = item.querySelectorAll('.dot');
                    const count = data.aptitudes[aptitudeName];
                    dots.forEach((dot, index) => {
                        dot.classList.toggle('filled', index < count);
                    });
                }
            }
        }
        
        // Динамические навыки
        if (data.dynamicSkills) {
            skillTypes.forEach(skillType => {
                const container = document.getElementById(`${skillType}-container`);
                // Очищаем контейнер
                container.innerHTML = '';
                
                if (data.dynamicSkills[skillType] && data.dynamicSkills[skillType].length > 0) {
                    // Добавляем строки с данными
                    data.dynamicSkills[skillType].forEach(skillData => {
                        addSkillRow(skillType, skillData);
                    });
                } else {
                    // Добавляем одну пустую строку, если нет данных
                    addSkillRow(skillType);
                }
            });
        }
        
        // Улучшения характеристик
        if (data.improvements) {
            for (const statName in data.improvements) {
                const statItem = document.querySelector(`#stat-${statName}`).closest('.stat-item');
                if (statItem) {
                    const dots = statItem.querySelectorAll('.improvement-dot');
                    const count = data.improvements[statName];
                    dots.forEach((dot, index) => {
                        dot.classList.toggle('filled', index < count);
                    });
                }
            }
        }
        
        // Опыт
        if (data.experience) {
            currentExpInput.value = data.experience.current || 0;
            usedExpInput.value = data.experience.used || 0;
            totalExpInput.value = data.experience.total || 0;
        }
    }
    
    // --- СОХРАНЕНИЕ В ФАЙЛ ---
    saveButton.addEventListener('click', () => {
        const data = getFormData();
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const charName = (document.getElementById('char-name').value.trim() || 'character').replace(/[^a-z0-9]/gi, '_');
        a.href = url;
        a.download = `${charName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // --- ЗАГРУЗКА ИЗ ФАЙЛА ---
    loadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    setFormData(data);
                } catch (error) {
                    console.error("Ошибка чтения файла:", error);
                    alert('Ошибка при чтении файла. Убедитесь, что это корректный JSON-файл персонажа.');
                }
            };
            reader.readAsText(file);
            loadInput.value = '';
        }
    });
    
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', (event) => {
        if (event.target === confirmModal) {
            closeModal();
        }
    });
});