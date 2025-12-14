# Документация по декораторам

Декораторы используются для декларативного описания правил полей entity/DTO и автоматической генерации/применения преобразований и валидаций.

## Использование

Все декораторы импортируются из `infrastructure/decorators`:

```typescript
import { Required, Transform, Alias, Dictionary, IgnoreOnSave } from '@/infrastructure/decorators';
```

## @Required()

Помечает поле как обязательное для валидации.

**Пример:**
```typescript
class Employee {
  @Required()
  firstName: string;
  
  lastName: string; // необязательное поле
}
```

**Использование:**
- Валидация форм (UI может использовать метаданные для показа обязательных полей)
- Ранняя проверка при создании/обновлении сущностей

## @Transform()

Указывает правила трансформации при маппинге DTO ↔ Domain.

**Типы трансформаций:**
- `'isoDate'`: ISO строка ↔ Date объект
- `'boolString'`: `'true'/'false'` ↔ boolean
- `'dictionary'`: `{code, name}` ↔ DictionaryVO
- `'nullable'`: Пустые строки → null

**Пример:**
```typescript
class Employee {
  @Transform({ from: 'isoDate' })
  startDate: Date;
  
  @Transform({ from: 'boolString' })
  isActive: boolean;
  
  @Transform({ from: 'dictionary' })
  position: DictionaryVO;
}
```

**Параметры:**
- `from`: Тип трансформации при преобразовании DTO → Domain
- `to`: (опционально) Тип трансформации при преобразовании Domain → DTO (по умолчанию используется `from`)
- `nullable`: (опционально) Разрешить null значения

## @Alias()

Указывает альтернативные имена полей в DTO. Позволяет мапперам находить поля по разным именам.

**Пример:**
```typescript
class Employee {
  @Alias('first_name', 'firstName')
  firstName: string;
  
  @Alias('last_name', 'lastName')
  lastName: string;
}
```

При маппинге из DTO маппер будет искать поле по имени `firstName`, `first_name` или `firstName` (в указанном порядке).

## @Dictionary()

Помечает поле как словарь. Поле должно быть преобразовано в `DictionaryVO` при маппинге.

**Пример:**
```typescript
class Employee {
  @Dictionary()
  position: DictionaryVO;
}
```

Эквивалентно использованию `@Transform({ from: 'dictionary' })`.

## @IgnoreOnSave()

Поле, которое не нужно сохранять в API/DB при сохранении. Используется для вычисляемых полей или временных данных.

**Пример:**
```typescript
class Employee {
  @IgnoreOnSave()
  computedField: string; // Не будет сохранено в БД
  
  firstName: string; // Будет сохранено
}
```

## Метаданные

Декораторы сохраняют метаданные в `metadata.store.ts`. Мапперы и валидаторы обращаются к метаданным для применения правил.

**Получение метаданных:**
```typescript
import { getMeta, getAllMeta } from '@/infrastructure/decorators';

// Получить метаданные для конкретного поля
const meta = getMeta(Employee, 'firstName');

// Получить все метаданные для класса
const allMeta = getAllMeta(Employee);
```

## Примеры использования

### Полный пример Entity с декораторами

```typescript
import { Required, Transform, Alias, Dictionary } from '@/infrastructure/decorators';
import { DictionaryVO } from '@/domain/value-objects/dictionary.vo';

class Employee {
  id: string;
  
  @Required()
  @Alias('first_name')
  firstName: string;
  
  @Required()
  @Alias('last_name')
  lastName: string;
  
  @Transform({ from: 'boolString' })
  @Alias('is_active')
  isActive: boolean;
  
  @Transform({ from: 'isoDate' })
  @Alias('start_date')
  startDate: Date | null;
  
  @Dictionary()
  @Alias('position')
  position: DictionaryVO | null;
}
```

### Использование в мапперах

Мапперы автоматически используют метаданные для применения трансформаций:

```typescript
class EmployeeMapper extends BaseMapper<EmployeeDTO, Employee> {
  async toDomain(dto: EmployeeDTO): Promise<Employee> {
    // Маппер автоматически применяет трансформации на основе метаданных
    // Например, если поле помечено @Transform({ from: 'boolString' }),
    // маппер преобразует 'true' → true автоматически
  }
}
```

## Расширение

Для добавления нового типа трансформации:

1. Добавьте новый тип в `TransformType` в `transform.decorator.ts`
2. Реализуйте логику трансформации в `BaseMapper.applyTransforms()`
3. Используйте новый тип в декораторе `@Transform()`

