import { Plugin } from 'ckeditor5/src/core';

export default class CharacterLimitEditing extends Plugin {
  constructor(editor) {
    super(editor);
    this.editor = editor;
    this.maxChars = editor.config.get('BUFCharacterLimit.maxChars') || 500;
    this.lockEditor = editor.config.get('BUFCharacterLimit.lockEditor') !== false;
    this.currentLength = 0;
  }

  init() {
    const editor = this.editor;
    
    // Регистрация счетчика символов в состоянии редактора
    this._setupCharacterCounter(editor);
  }

  _setupCharacterCounter(editor) {
    // Используем throttle-функцию, чтобы не перегружать систему
    const throttle = (func, limit) => {
      let lastFunc;
      let lastRan;
      return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
          func.apply(context, args);
          lastRan = Date.now();
        } else {
          clearTimeout(lastFunc);
          lastFunc = setTimeout(function() {
            if ((Date.now() - lastRan) >= limit) {
              func.apply(context, args);
              lastRan = Date.now();
            }
          }, limit - (Date.now() - lastRan));
        }
      };
    };

    // Добавляем обработчик с throttle
    editor.model.document.on('change:data', throttle(() => {
      this.currentLength = this._getCharacterCount();
      
      // Обновляем состояние и отправляем событие, чтобы UI мог обновиться
      editor.fire('characterCount', {
        characters: this.currentLength,
        maxCharacters: this.maxChars,
        remaining: this.maxChars - this.currentLength
      });
      
      // Если включена блокировка редактора
      if (this.lockEditor && this.currentLength > this.maxChars) {
        // Отменяем изменение, если превышен лимит
        this._trimContent(editor);
      }
    }, 200));
  }

  _trimContent(editor) {
    editor.model.change(writer => {
      // Если превышен лимит, нужно обрезать текст
      const rootElement = editor.model.document.getRoot();
      let text = '';
      let allText = '';

      // Собираем весь текст из документа
      for (const item of rootElement.getChildren()) {
        const itemText = this._getTextFromElement(item);
        allText += itemText;
      }

      // Если текст превышает лимит, обрезаем его
      if (allText.length > this.maxChars) {
        // Создаем новый контент с обрезанным текстом
        const trimmedText = allText.substring(0, this.maxChars);
        
        // Очищаем документ
        writer.remove(writer.createRangeIn(rootElement));
        
        // Вставляем обрезанный текст
        writer.insertText(trimmedText, rootElement, 0);
      }
    });
  }

  _getCharacterCount() {
    const model = this.editor.model;
    let chars = 0;
    
    // Обходим весь документ и считаем символы
    for (const item of model.document.getRoot().getChildren()) {
      chars += this._countCharactersInElement(item);
    }
    
    return chars;
  }
  
  _countCharactersInElement(element) {
    let chars = 0;
    
    // Рекурсивно обходим все дочерние элементы
    for (const node of element.getChildren()) {
      if (node.is('text')) {
        chars += node.data.length;
      } else if (node.is('element')) {
        chars += this._countCharactersInElement(node);
      }
    }
    
    return chars;
  }

  _getTextFromElement(element) {
    let text = '';
    
    if (element.is('text')) {
      return element.data;
    }
    
    // Рекурсивно обходим все дочерние элементы
    for (const node of element.getChildren()) {
      if (node.is('text')) {
        text += node.data;
      } else if (node.is('element')) {
        text += this._getTextFromElement(node);
      }
    }
    
    return text;
  }
}
