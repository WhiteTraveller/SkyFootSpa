# EntityJSEvents.biomeSpawns

## Basic info

- Valid script types: [SERVER]

- Has result? ✘

- Event class: BiomeSpawnsEventJS (third-party)

### Available fields:

| Name | Type | Static? |
| ---- | ---- | ------- |

Note: Even if no fields are listed above, some methods are still available as fields through *beans*.

### Available methods:

| Name | Parameters | Return type | Static? |
| ---- | ---------- | ----------- | ------- |
| removeSpawn | EntityType<?>, List<String> |  | void | ✘ |
| addSpawn | EntityType<?>, List<String>, int, int, int |  | void | ✘ |
| cancel | Object |  | Object | ✘ |
| cancel |  |  | Object | ✘ |
| exit |  |  | Object | ✘ |
| exit | Object |  | Object | ✘ |
| success | Object |  | Object | ✘ |
| success |  |  | Object | ✘ |


### Documented members:

- `void removeSpawn(EntityType<?> entityType, List<String> biomes)`

  Parameters:
  - entityType: EntityType<?>- The entity type to remove spawns from
  - biomes: List<String>- A list of biomes and biome tags to remove the spawns from

```
Removes the given entity type spawns from the given biomes
```

- `void addSpawn(EntityType<?> entityType, List<String> biomes, int weight, int minCount, int maxCount)`

  Parameters:
  - entityType: EntityType<?>- The entity type to add a spawn to
  - biomes: List<String>- A list of biomes and biome tags to spawn in
  - weight: int- The spawn weight
  - minCount: int- The minimum number of entities to spawn
  - maxCount: int- The maximum number of entities to spawn

```
Adds a spawn to the given entity type in the given biomes
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
EntityJSEvents.biomeSpawns((event) => {
	// This space (un)intentionally left blank
});
```

