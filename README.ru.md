# Библиотека Hierarchic UI для InnerCore
Эта библиотека позволит создавать иерархический интерфейс на основе макетов, для модов на InnerCore.

### Начало работы и базовые примеры
Чтобы импортировать библиотеку, поместите её в папку `lib` (или `src/lib` если вы используете тулчейн) и используйте `IMPORT("Layout")` в начале кода вашего мода.

Все ваши макеты и изображения окон по стандарту загружаются из директории `ui-screens` внутри вашего мода, но вы можете также загружать их из других мест.

Для того, чтобы создать ваше первое изображение, создайте `test-view.json` внутри директории `ui-screens`, это будет базовое изображение текста.

```
{
    //объявите тип ресурса, и id, который будет использоваться для доступа этому ресурсу
    "layout_id": "test_view",
    "scope": "view",
    
    // далее, объявите само изображение
    "type": "text",
    "desc": {
        "text": "Тестовое изображение"
    }
}
```

Далее, объявите макет окна, который представляет простое окно, содержащее наше изображение:

```
{
    "layout_id": "test_window",
    "scope": "window_layout",
    
    // список всех окон в этом макете
    "windows": [
        {
            //цвет фона окна, по умолчанию прозрачный
            "background": "red",
            
            // расположение окна на экране, в верхнем правом углу со смещением 10 и 200 и размером 200 на 100 юнитов
            "constraints": {
                "top": 10,
                "right": 10,
                "width": 200,
                "height": 100
            },
            
            // изображение содержимого окна
            "view": "test_view"
        }
    ]
}
```

Чтобы парснуть и показать это простое окно, используйте `UiStaticParser`:
```
let window = UiStaticParser.parseWindowGroup("test_window");
window.open(); // открыть окно без контейнера
window.getNativeWindow(); // возвращает объект окна InnerCore (в данном случае UI.WindowGroup)
```

### Макеты

Ключевыми возможностями этой библиотеки являются макеты и иерархия изображений. Макеты - это группы изображений, выровненных по разному. В данный момент у нас есть только 2 типа макетов: линейный и абсолютный.

Абсолютные макеты просто выравнивает все изображения друг над другом, в соответствии с их паддингом и размерами, а линейный макет выравнивает все изображения последовательно вертикально или горизонтально.

Давайте создадим рамку, содержащую текст и потом изображение:
```
{
    "layout_id": "framed_content",
    "scope": "view",
    
    "type": "absolute_layout",
    // дайте этому изображению заполнить всё доступное пространство
    "width": "fill",
    "height": "fill",
    
    // список дочерних изображений
    "children": [
        //фоновая рамка
        {
            "type": "frame",
            "width": "fill",
            "height": "fill",
            "desc": {
                "bitmap": "classic_frame_bg",
                "color": "#aaaaaa",
                "scale": 4
            }
        },
        
        {
            "type": "linear_layout",
            "orientation": "vertical",
            
            "width": "fill",
            "height": "fill",
            "padding": [16], // паддинг для всех сторон, может быть [все стороны] или [левая, верхняя, правая, нижняя]
            
            "children": [
                {
                    "type": "text",
                    "desc": {
                        "text": "какой-то длинный тестовый текст"    
                    }
                },
                {
                    "type": "image",
                    "width": 200,
                    "height": 200,
                    "padding": [20],
                    "desc": {
                        "bitmap": "icon_menu_innercore"
                    }
                }
            ]
        }
    ]
}
```

Используйте это изображение внутри ранее объявленного окна, но сделайте то окно побольше, например, 400х400. Результат должен выглядеть как-то так:

![N|Solid](https://i.imgur.com/Kc4ZArg.png)


### Наследование и встроенные изображения
Библиотека содержит возможности, которые позволяют строить сложные конструкции, состоящие из множества разных компонентов.

Чтобы наследовать изображение от другого, добавьте параметр `"parent_id":"id изображения"` в json изображения. Это скопирует все родительские параметры, а потом параметры этого изображения. Также следует заметить, что написание только `{"parent_id":"id изображения"}` и просто `"id изображения"` будет иметь одинаковый результат, потому что не объявлено новых параметров.

Встроенные изображения - более сложное понятие. Вы можете добавить параметр `"embedded":{"name1": ...id изображения или его объявление..., "name2": ...}` и для этого и всех дочерних изображений родительские id `"#name1"`, `"#name2"` и другие объявленные будут доступны.

В данном примере мы создадим и используем макет изображения, который представляет собой рамку с изображением внутри неё.

```
{
    "layout_id": "view_frame",
    "scope": "view",
    
    "type": "absolute_layout",
    "width": "fill",
    "height": "fill",
    
    "children": [
        // фоновая рамка
        {
            "type": "frame",
            "width": "fill",
            "height": "fill",
            "desc": {
                "bitmap": "classic_frame_bg",
                "color": "#aaaaaa",
                "scale": 4
            }
        },
        // встроенное изображение
        {
            "parent_id": "#framed_view",
            // паддинг настройки для вписывания в рамку
            "padding": [16]
        }
    ]
}
```

Далее мы встроим изображение в эту рамку.
```
{
    "layout_id": "embedded_framed_content",
    "scope": "view",
    
    // наследуем от view_frame
    "parent_id": "view_frame",
    
    "embedded": {
        // встроенное изображение текста
        "framed_view": {
            "type": "text",
            "desc": {
                "text": "какой-то длинный тестовый текст"    
            }
        }
    }
}
```