# EntityJSEvents.attributes

## Basic info

- Valid script types: [STARTUP]

- Has result? ✘

- Event class: ModifyAttributeEventJS (third-party)

### Available fields:

| Name | Type | Static? |
| ---- | ---- | ------- |

Note: Even if no fields are listed above, some methods are still available as fields through *beans*.

### Available methods:

| Name | Parameters | Return type | Static? |
| ---- | ---------- | ----------- | ------- |
| getAllTypes |  |  | List<EntityType<? extends LivingEntity>> | ✘ |
| getAttributes | EntityType<? extends LivingEntity> |  | List<Attribute> | ✘ |
| modify | EntityType<? extends LivingEntity>, Consumer<AttributeModificationHelper> |  | void | ✘ |
| cancel | Object |  | Object | ✘ |
| cancel |  |  | Object | ✘ |
| exit |  |  | Object | ✘ |
| exit | Object |  | Object | ✘ |
| success | Object |  | Object | ✘ |
| success |  |  | Object | ✘ |


### Documented members:

- `List<EntityType<? extends LivingEntity>> getAllTypes()`
```
Returns a list of all entity types that can have their attributes modified by this event
```

- `List<Attribute> getAttributes(EntityType<? extends LivingEntity> var0)`

  Parameters:
  - var0: EntityType<? extends LivingEntity>

```
Returns a list of all attributes the given entity type has by default
```

- `void modify(EntityType<? extends LivingEntity> entityType, Consumer<AttributeModificationHelper> attributes)`

  Parameters:
  - entityType: EntityType<? extends LivingEntity>- The entity type whose default attributes are to be modified
  - attributes: Consumer<AttributeModificationHelper>- A consumer for setting the default attributes and their values

```
Modifies the given entity type's attributes
```

- `Object cancel(Object var0)`

  Parameters:
  - var0: Object

```
Cancels the event with the given exit value. Execution will be stopped **immediately**.

`cancel` denotes a `false` outcome.
```

- `Object cancel()`
```
Cancels the event with default exit value. Execution will be stopped **immediately**.

`cancel` denotes a `false` outcome.
```

- `Object exit()`
```
Stops the event with default exit value. Execution will be stopped **immediately**.

`exit` denotes a `default` outcome.
```

- `Object exit(Object var0)`

  Parameters:
  - var0: Object

```
Stops the event with the given exit value. Execution will be stopped **immediately**.

`exit` denotes a `default` outcome.
```

- `Object success(Object var0)`

  Parameters:
  - var0: Object

```
Stops the event with the given exit value. Execution will be stopped **immediately**.

`success` denotes a `true` outcome.
```

- `Object success()`
```
Stops the event with default exit value. Execution will be stopped **immediately**.

`success` denotes a `true` outcome.
```



### Example script:

```js
EntityJSEvents.attributes((event) => {
	// This space (un)intentionally left blank
});
```

