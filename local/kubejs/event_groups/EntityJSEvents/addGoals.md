# EntityJSEvents.addGoals

## Basic info

- Valid script types: [SERVER]

- Has result? ✘

- Event class: AddGoalTargetsEventJS (third-party)

### Available fields:

| Name | Type | Static? |
| ---- | ---- | ------- |

Note: Even if no fields are listed above, some methods are still available as fields through *beans*.

### Available methods:

| Name | Parameters | Return type | Static? |
| ---- | ---------- | ----------- | ------- |
| nonTameRandomTarget | int, Class<E extends LivingEntity>, boolean, Predicate<LivingEntity> |  | void | ✘ |
| resetUniversalAngerTarget | int, boolean |  | void | ✘ |
| arbitraryTargetGoal | int, Function<T extends Mob, Goal> |  | void | ✘ |
| nearestAttackableTarget | int, Class<E extends LivingEntity>, int, boolean, boolean, Predicate<LivingEntity>, AABB |  | void | ✘ |
| nearestAttackableTarget | int, Class<E extends LivingEntity>, int, boolean, boolean, Predicate<LivingEntity> |  | void | ✘ |
| removeGoal | Class<? extends Goal> |  | void | ✘ |
| removeGoals | Function<GoalContext, Boolean> |  | void | ✘ |
| removeAllGoals |  |  | void | ✘ |
| hurtByTarget | int, List<Class<?>>, boolean, List<Class<?>> |  | void | ✘ |
| ownerHurtByTarget | int |  | void | ✘ |
| getEntity |  |  | Mob | ✘ |
| cancel | Object |  | Object | ✘ |
| cancel |  |  | Object | ✘ |
| exit |  |  | Object | ✘ |
| exit | Object |  | Object | ✘ |
| success | Object |  | Object | ✘ |
| success |  |  | Object | ✘ |


### Documented members:

- `void nonTameRandomTarget(int priority, Class<E extends LivingEntity> targetClass, boolean mustSee, Predicate<LivingEntity> targetConditions)`

  Parameters:
  - priority: int- The priority of the goal
  - targetClass: Class<E extends LivingEntity>- The entity class that should be targeted
  - mustSee: boolean- If the mob must have line of sight at all times
  - targetConditions: Predicate<LivingEntity>- The conditions under which the targeted entity will be targeted, may be null

```
Adds a `NonTameRandomTargetGoal` to the entity, only applicable to **tamable** mobs
```

- `void resetUniversalAngerTarget(int priority, boolean alertOthersOfSameType)`

  Parameters:
  - priority: int- The priority of the goal
  - alertOthersOfSameType: boolean- If other mobs of the same type should be alerted

```
Adds a `ResetUniversalAngerTargetGoal` to the entity, only applicable to **neutral** mobs
```

- `void arbitraryTargetGoal(int priority, Function<T extends Mob, Goal> goalSupplier)`

  Parameters:
  - priority: int- The priority of the goal
  - goalSupplier: Function<T extends Mob, Goal>- The goal supplier, a function that takes a Mob and returns a Goal

```
Enables the addition of arbitrary goals to an entity

It is the responsibility of the user to ensure the goal is
compatible with the entity

Example of usage:
=====================================
builder.arbitraryTargetGoal(3, entity -> new $DefendVillageTargetGoal(entity))
=====================================

Note in the example the entity must be an instance of IronGolem
```

- `void nearestAttackableTarget(int priority, Class<E extends LivingEntity> targetClass, int randomInterval, boolean mustSee, boolean mustReach, Predicate<LivingEntity> targetConditions, AABB radius)`

  Parameters:
  - priority: int- The priority of the goal
  - targetClass: Class<E extends LivingEntity>- The entity class that should be targeted
  - randomInterval: int- The interval at which the goal amy be 'refreshed'
  - mustSee: boolean- If the mob must have line of sight at all times
  - mustReach: boolean- If the mob must be able to reach the target to attack
  - targetConditions: Predicate<LivingEntity>- The conditions under which the targeted entity will be targeted, may be null
  - radius: AABB- The AABB radius to check for a potential target

```
Adds a `NearestAttackableTargetGoalJS` to the entity
```

- `void nearestAttackableTarget(int priority, Class<E extends LivingEntity> targetClass, int randomInterval, boolean mustSee, boolean mustReach, Predicate<LivingEntity> targetConditions)`

  Parameters:
  - priority: int- The priority of the goal
  - targetClass: Class<E extends LivingEntity>- The entity class that should be targeted
  - randomInterval: int- The interval at which the goal amy be 'refreshed'
  - mustSee: boolean- If the mob must have line of sight at all times
  - mustReach: boolean- If the mob must be able to reach the target to attack
  - targetConditions: Predicate<LivingEntity>- The conditions under which the targeted entity will be targeted, may be null

```
Adds a `NearestAttackableTargetGoal` to the entity
```

- `void removeGoal(Class<? extends Goal> goal)`

  Parameters:
  - goal: Class<? extends Goal>- The goal class to remove

```
Remove a goal from the entity via class reference.

Example of usage:
=====================================
let $PanicGoal = Java.loadClass("net.minecraft.world.entity.ai.goal.PanicGoal")
builder.removeGoal($PanicGoal)
=====================================
```

- `void removeGoals(Function<GoalContext, Boolean> goalFunction)`

  Parameters:
  - goalFunction: Function<GoalContext, Boolean>- A function to remove goals with entity & available goals as arguments

```
Remove all goals fitting the specified predicate. Returns a boolean

Example of usage:
=====================================
let $PanicGoal = Java.loadClass("net.minecraft.world.entity.ai.goal.PanicGoal")
e.removeGoals(context => {
    const { goal, entity } = context
    return goal.getClass() == $PanicGoal
})
=====================================
```

- `void removeAllGoals()`
```
Remove all goals.

Example of usage:
=====================================
builder.removeAllGoals()
=====================================
```

- `void hurtByTarget(int priority, List<Class<?>> toIgnoreDamage, boolean alertOthers, List<Class<?>> toIgnoreAlert)`

  Parameters:
  - priority: int- The priority of the goal
  - toIgnoreDamage: List<Class<?>>- The classes that damage should be ignored from
  - alertOthers: boolean- If other mobs should be alerted when this mob is damaged
  - toIgnoreAlert: List<Class<?>>- The entity classes that should not be alerted

```
Adds s `HurtByTargetGoal` to the entity, only applicable to **pathfinder** mobs
```

- `void ownerHurtByTarget(int priority)`

  Parameters:
  - priority: int- The priority of the goal

```
Adds a `OwnerHurtByTargetGoal` to the entity, only applicable to **tamable** mobs
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
EntityJSEvents.addGoals(extra_id, (event) => {
	// This space (un)intentionally left blank
});
```

