# EntityJSEvents.buildBrainProvider

## Basic info

- Valid script types: [SERVER]

- Has result? ✘

- Event class: BuildBrainProviderEventJS (third-party)

```
This event is fired during entity creation and is responsible
for adding the `MemoryModuleType` and `SensorType`s the used
by the entity.

This is only posted for entities made through a builder
```

### Available fields:

| Name | Type | Static? |
| ---- | ---- | ------- |

Note: Even if no fields are listed above, some methods are still available as fields through *beans*.

### Available methods:

| Name | Parameters | Return type | Static? |
| ---- | ---------- | ----------- | ------- |
| addMemory | MemoryModuleType<?> |  | void | ✘ |
| addSensor | SensorType<? extends Sensor<? super LivingEntity>> |  | void | ✘ |
| provide |  |  | Brain.Brain$Provider<T extends LivingEntity> | ✘ |
| cancel | Object |  | Object | ✘ |
| cancel |  |  | Object | ✘ |
| exit |  |  | Object | ✘ |
| exit | Object |  | Object | ✘ |
| success | Object |  | Object | ✘ |
| success |  |  | Object | ✘ |


### Documented members:

- `void addMemory(MemoryModuleType<?> var0)`

  Parameters:
  - var0: MemoryModuleType<?>

```
Adds the provided `MemoryModuleType` to the entity type's memories
```

- `void addSensor(SensorType<? extends Sensor<? super LivingEntity>> var0)`

  Parameters:
  - var0: SensorType<? extends Sensor<? super LivingEntity>>

```
Adds the provided `SensorType` to the entity type's sensors
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
EntityJSEvents.buildBrainProvider(extra_id, (event) => {
	// This space (un)intentionally left blank
});
```

