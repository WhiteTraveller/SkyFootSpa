# EntityJSEvents.spawnPlacement

## Basic info

- Valid script types: [STARTUP]

- Has result? ✘

- Event class: RegisterSpawnPlacementsEventJS (third-party)

### Available fields:

| Name | Type | Static? |
| ---- | ---- | ------- |

Note: Even if no fields are listed above, some methods are still available as fields through *beans*.

### Available methods:

| Name | Parameters | Return type | Static? |
| ---- | ---------- | ----------- | ------- |
| replace | EntityType<T extends Entity>, SpawnPlacements$Type, Heightmap$Types, SpawnPlacements.SpawnPlacements$SpawnPredicate<T extends Entity> |  | void | ✘ |
| or | EntityType<T extends Entity>, SpawnPlacements.SpawnPlacements$SpawnPredicate<T extends Entity> |  | void | ✘ |
| and | EntityType<T extends Entity>, SpawnPlacements.SpawnPlacements$SpawnPredicate<T extends Entity> |  | void | ✘ |
| cancel | Object |  | Object | ✘ |
| cancel |  |  | Object | ✘ |
| exit |  |  | Object | ✘ |
| exit | Object |  | Object | ✘ |
| success | Object |  | Object | ✘ |
| success |  |  | Object | ✘ |


### Documented members:

- `void replace(EntityType<T extends Entity> entityType, SpawnPlacements$Type placementType, Heightmap$Types heightmap, SpawnPlacements.SpawnPlacements$SpawnPredicate<T extends Entity> predicate)`

  Parameters:
  - entityType: EntityType<T extends Entity>- The entity type whose spawn placement is being replaced
  - placementType: SpawnPlacements$Type- The spawn placement type to use
  - heightmap: Heightmap$Types- The heightmap to use
  - predicate: SpawnPlacements.SpawnPlacements$SpawnPredicate<T extends Entity>- The spawn predicate for the entity type's spawning

```
Replaces the given entity type's spawn rules
```

- `void or(EntityType<T extends Entity> entityType, SpawnPlacements.SpawnPlacements$SpawnPredicate<T extends Entity> predicate)`

  Parameters:
  - entityType: EntityType<T extends Entity>- The entity type whose spawn placement is being modified
  - predicate: SpawnPlacements.SpawnPlacements$SpawnPredicate<T extends Entity>- The spawn predicate that will be ORed with the entity type's existing spawn predicates

```
ORs the given spawn predicate with the existing spawn predicate of the given entity type
```

- `void and(EntityType<T extends Entity> entityType, SpawnPlacements.SpawnPlacements$SpawnPredicate<T extends Entity> predicate)`

  Parameters:
  - entityType: EntityType<T extends Entity>- The entity type whose spawn placement is being modified
  - predicate: SpawnPlacements.SpawnPlacements$SpawnPredicate<T extends Entity>- The spawn predicate that will be ANDed with the entity type's existing spawn predicates

```
ANDs the given spawn predicate with the existing spawn predicates of the given entity type
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
EntityJSEvents.spawnPlacement((event) => {
	// This space (un)intentionally left blank
});
```

