# EntityJSEvents.modifyEntity

## Basic info

- Valid script types: [STARTUP]

- Has result? ✘

- Event class: EntityModificationEventJS (third-party)

### Available fields:

| Name | Type | Static? |
| ---- | ---- | ------- |
| eventMap | Map<EntityType<?>, EntityModificationEventJS> | ✔ |
| createCustomMap | Map<ResourceLocation, Consumer<ModifyEntityBuilder>> | ✔ |

Note: Even if no fields are listed above, some methods are still available as fields through *beans*.

### Available methods:

| Name | Parameters | Return type | Static? |
| ---- | ---------- | ----------- | ------- |
| determineModificationType | EntityType<?>, Entity |  | ModifyEntityBuilder | ✘ |
| getOrCreate | EntityType<?>, Entity |  | EntityModificationEventJS | ✔ |
| modify | EntityType<?>, Consumer<? extends ModifyEntityBuilder> |  | void | ✘ |
| cancel | Object |  | Object | ✘ |
| cancel |  |  | Object | ✘ |
| exit |  |  | Object | ✘ |
| exit | Object |  | Object | ✘ |
| success | Object |  | Object | ✘ |
| success |  |  | Object | ✘ |


### Documented members:

- `void modify(EntityType<?> entityType, Consumer<? extends ModifyEntityBuilder> modifyBuilder)`

  Parameters:
  - entityType: EntityType<?>- The entity type to modify
  - modifyBuilder: Consumer<? extends ModifyEntityBuilder>- A consumer to modify the entity type.

```
Entity type modification event. Allows modification of methods for any existing entity. 
 
This event determines the entity's type and uses the appropriate builder for modification. 
 
Builders: 
    - ModifyPathfinderMobBuilder: For entities extending {@link PathfinderMob} 
    - ModifyMobBuilder: For entities extending {@link Mob} 
    - ModifyLivingEntityBuilder: For entities extending {@link LivingEntity} 
    - ModifyEntityBuilder: For entities extending {@link Entity} 
 
Example usage: 
```javascript
EntityJSEvents.modifyEntity(event => {
    event.modify("minecraft:zombie", builder => {
        builder.onRemovedFromWorld(entity => {
            // Execute code when the zombie is removed from the world.
        })
    })
})
```
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
EntityJSEvents.modifyEntity((event) => {
	// This space (un)intentionally left blank
});
```

