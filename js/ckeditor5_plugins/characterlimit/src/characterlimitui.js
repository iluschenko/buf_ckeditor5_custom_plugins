import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';

export default class CharacterLimitUI extends Plugin {
  static get pluginName() {
    return 'CharacterLimitUI';
  }

  init() {
    const editor = this.editor;
    const t = editor.t;
    
    // Проверяем конфигурацию
    const enabled = editor.config.get('BUFCharacterLimit.enabled') !== false;
    const showCount = editor.config.get('BUFCharacterLimit.showCharacterCount') !== false;
    const showRemaining = editor.config.get('BUFCharacterLimit.showRemaining') !== false;
    
    if (!enabled || (!showCount && !showRemaining)) {
      return;
    }
    
    const maxChars = editor.config.get('BUFCharacterLimit.maxChars') || 500;
    
    // Создаем элемент для тулбара
    editor.ui.componentFactory.add('characterCounter', () => {
      const view = new ButtonView();
      
      // Инициализируем с начальным значением
      view.set({
        label: `0/${maxChars}`,
        withText: true,
        tooltip: t('Character count'),
        class: 'ck-character-counter'
      });
      
      // Отключаем действие по клику
      view.on('execute', () => {
        return false;
      });
      
      // Обновляем счетчик при изменении текста
      editor.on('characterCount', (evt, data) => {
        const { characters, remaining } = data;
        const isOverLimit = characters > maxChars;
        
        let counterText = '';
        
        if (showCount && showRemaining) {
          counterText = `${characters}/${maxChars}`;
        } else if (showCount) {
          counterText = `${characters}`;
        } else if (showRemaining) {
          counterText = `${remaining}`;
        }
        
        view.set({
          label: counterText
        });
        
        if (isOverLimit && view.element) {
          view.element.classList.add('ck-character-counter--over-limit');
        } else if (view.element) {
          view.element.classList.remove('ck-character-counter--over-limit');
        }
      });
      
      // Выполним начальный подсчет после инициализации редактора
      editor.on('ready', () => {
        // Подсчет символов при загрузке
        const countChars = () => {
          let count = 0;
          const model = editor.model;
          
          // Простой подсчет символов
          for (const rootName of model.document.getRootNames()) {
            const root = model.document.getRoot(rootName);
            for (const item of root.getChildren()) {
              if (item.is('element')) {
                count += countCharactersInElement(item);
              }
            }
          }
          
          return count;
        };
        
        // Вспомогательная функция для подсчета символов в элементе
        const countCharactersInElement = (element) => {
          let chars = 0;
          
          for (const node of element.getChildren()) {
            if (node.is('text')) {
              chars += node.data.length;
            } else if (node.is('element')) {
              chars += countCharactersInElement(node);
            }
          }
          
          return chars;
        };
        
        const characters = countChars();
        
        // Установим начальное значение счетчика
        editor.fire('characterCount', {
          characters: characters,
          maxCharacters: maxChars,
          remaining: maxChars - characters
        });
      });
      
      return view;
    });
  }
}