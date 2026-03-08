# StartupEvents.registry

## Basic info

- Valid script types: [STARTUP]

- Has result? ✘

- Event class: [RegistryEventJS](https://github.com/KubeJS-Mods/KubeJS/tree/2001/common/src/main/java/dev/latvian/mods/kubejs/registry/RegistryEventJS.java)

### Available fields:

| Name | Type | Static? |
| ---- | ---- | ------- |
| created | List<BuilderBase<? extends T>> | ✘ |

Note: Even if no fields are listed above, some methods are still available as fields through *beans*.

### Available methods:

| Name | Parameters | Return type | Static? |
| ---- | ---------- | ----------- | ------- |
| createCustom | String, Supplier<Object> |  | CustomBuilderObject | ✘ |
| create | String, String |  | BuilderBase<? extends T> | ✘ |
| create | String |  | BuilderBase<? extends T> | ✘ |
| custom | String, Object |  | CustomBuilderObject | ✘ |
| createCustom | String, Class, Consumer |  | CustomEntityBuilder | ✘ |
| cancel | Object |  | Object | ✘ |
| cancel |  |  | Object | ✘ |
| exit |  |  | Object | ✘ |
| exit | Object |  | Object | ✘ |
| success | Object |  | Object | ✘ |
| success |  |  | Object | ✘ |


### Documented members:

- `CustomEntityBuilder createCustom(String var0, Class var1, Consumer var2)`

  Parameters:
  - var0: String
  - var1: Class
  - var2: Consumer

```
Creates a new custom entity based on an existing living entity class.
This allows extending or modifying behavior of vanilla or modded entities dynamically.

The builder provided in the callback can be used to directly access the respective entity's modification builder.

Example usage:
```javascript
let Villager = Java.loadClass("net.minecraft.world.entity.npc.Villager")
event.createCustom('wyrm', Villager, modifyBuilder => {
    modifyBuilder.tick(entity => {
        console.log(entity.type)
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
StartupEvents.registry(extra_id, (event) => {
	// This space (un)intentionally left blank
});
```

