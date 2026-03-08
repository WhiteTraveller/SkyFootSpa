# EntityJSEvents.addGoalSelectors

## Basic info

- Valid script types: [SERVER]

- Has result? ✘

- Event class: AddGoalSelectorsEventJS (third-party)

### Available fields:

| Name | Type | Static? |
| ---- | ---- | ------- |

Note: Even if no fields are listed above, some methods are still available as fields through *beans*.

### Available methods:

| Name | Parameters | Return type | Static? |
| ---- | ---------- | ----------- | ------- |
| moveTowardsRestriction | int, double |  | void | ✘ |
| horseRunAroundLikeCrazy | int, double |  | void | ✘ |
| strollThroughVillage | int, int |  | void | ✘ |
| waterAvoidingRandomStroll | int, double, float |  | void | ✘ |
| climbOnTopOfPowderedSnow | int |  | void | ✘ |
| waterAvoidingRandomFlying | int, double |  | void | ✘ |
| removeGoal | Class<? extends Goal> |  | void | ✘ |
| removeGoals | Function<GoalContext, Boolean> |  | void | ✘ |
| removeAllGoals |  |  | void | ✘ |
| customGoal | String, int, Predicate<T extends Mob>, Predicate<T extends Mob>, boolean, Consumer<T extends Mob>, Consumer<T extends Mob>, boolean, Consumer<T extends Mob> |  | void | ✘ |
| arbitraryGoal | int, Function<T extends Mob, Goal> |  | void | ✘ |
| avoidEntity | int, Class<E extends LivingEntity>, Predicate<LivingEntity>, float, double, double, Predicate<LivingEntity> |  | void | ✘ |
| breed | int, double, Class<? extends Animal> |  | void | ✘ |
| breathAir | int |  | void | ✘ |
| breakDoor | int, int, Predicate<Difficulty> |  | void | ✘ |
| floatSwim | int |  | void | ✘ |
| removeBlock | int, ResourceLocation, double, int |  | void | ✘ |
| meleeAttack | int, double, boolean |  | void | ✘ |
| eatGrass | int |  | void | ✘ |
| lookAtEntity | int, Class<E extends LivingEntity>, float, float, boolean |  | void | ✘ |
| followParent | int, double |  | void | ✘ |
| followMob | int, double, float, float |  | void | ✘ |
| fleeSun | int, double |  | void | ✘ |
| followBoat | int |  | void | ✘ |
| followOwner | int, double, float, float, boolean |  | void | ✘ |
| moveBackToVillage | int, double, boolean |  | void | ✘ |
| moveTowardsTarget | int, double, float |  | void | ✘ |
| randomStroll | int, double, int, boolean |  | void | ✘ |
| openDoor | int, boolean |  | void | ✘ |
| ocelotAttack | int |  | void | ✘ |
| moveThroughVillage | int, double, boolean, int, Supplier<Boolean> |  | void | ✘ |
| leapAtTarget | int, float |  | void | ✘ |
| randomLookAround | int |  | void | ✘ |
| restrictSun | int |  | void | ✘ |
| rangedAttack | int, double, int, int, float |  | void | ✘ |
| tempt | int, double, Ingredient, boolean |  | void | ✘ |
| tryFindWater | int |  | void | ✘ |
| useItem | int, ItemStack, ResourceLocation, Predicate<T extends Mob> |  | void | ✘ |
| sitWhenOrdered | int |  | void | ✘ |
| randomSwimming | int, double, int |  | void | ✘ |
| panic | int, double |  | void | ✘ |
| getEntity |  |  | Mob | ✘ |
| cancel | Object |  | Object | ✘ |
| cancel |  |  | Object | ✘ |
| exit |  |  | Object | ✘ |
| exit | Object |  | Object | ✘ |
| success | Object |  | Object | ✘ |
| success |  |  | Object | ✘ |


### Documented members:

- `void moveTowardsRestriction(int priority, double speedModifier)`

  Parameters:
  - priority: int- The priority of the goal
  - speedModifier: double- Sets the speed at which the mob should try to move

```
Adds a `MoveTowardsRestrictionGoal` to the entity, only applicable to **pathfinder** mobs
```

- `void horseRunAroundLikeCrazy(int priority, double speedModifier)`

  Parameters:
  - priority: int- The priority of the goal
  - speedModifier: double- Sets the speed at which the mob should try to move

```
Adds a `RunAroundLikeCrazyGoal` to the entity, only applicable to **horse** mobs
```

- `void strollThroughVillage(int priority, int interval)`

  Parameters:
  - priority: int- The priority of the goal
  - interval: int- Sets how often the goal 'refreshes'

```
Adds a `StrollThroughVillageGoal` to the entity, only applicable to **pathfinder** mobs
```

- `void waterAvoidingRandomStroll(int priority, double speedModifier, float probability)`

  Parameters:
  - priority: int- The priority of the goal
  - speedModifier: double- Sets the speed at which the mob should try to move
  - probability: float- The probability, in the range [0, 1], that the entity picks a new position

```
Adds a `WaterAvoidRandomStrollingGoal` to the entity, only applicable to **pathfinder** mobs
```

- `void climbOnTopOfPowderedSnow(int priority)`

  Parameters:
  - priority: int- The priority of the goal

```
Adds a `ClimbOnTopOfPowderSnowGoal` to the entity
```

- `void waterAvoidingRandomFlying(int priority, double speedModifier)`

  Parameters:
  - priority: int- The priority of the goal
  - speedModifier: double- Sets the speed at which the mob should try to move

```
Adds a `WaterAvoidingRandomFlyingGoal` to the entity, only applicable to **pathfinder** mobs
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

- `void customGoal(String name, int priority, Predicate<T extends Mob> canUse, Predicate<T extends Mob> canContinueToUse, boolean isInterruptable, Consumer<T extends Mob> start, Consumer<T extends Mob> stop, boolean requiresUpdateEveryTick, Consumer<T extends Mob> tick)`

  Parameters:
  - name: String- The name of the custom goal
  - priority: int- The priority of the goal
  - canUse: Predicate<T extends Mob>- Determines if the entity can use the goal
  - canContinueToUse: Predicate<T extends Mob>- Determines if the entity can continue to use the goal, may be null
  - isInterruptable: boolean- If the goal may be interrupted
  - start: Consumer<T extends Mob>- The action to perform when the goal starts
  - stop: Consumer<T extends Mob>- The action to perform when the goal stops
  - requiresUpdateEveryTick: boolean- If the goal needs to be updated every tick
  - tick: Consumer<T extends Mob>- The action to perform when the goal ticks

```
Adds a custom goal to the entity
```

- `void arbitraryGoal(int priority, Function<T extends Mob, Goal> goalSupplier)`

  Parameters:
  - priority: int- The priority of the goal
  - goalSupplier: Function<T extends Mob, Goal>- The goal supplier, a function that takes a Mob and returns a Goal

```
Enables the addition of arbitrary goals to an entity

It is the responsibility of the user to ensure the goal is
compatible with the entity

Example of usage:
=====================================
builder.arbitraryGoal(3, entity -> new $PathFindToRaidGoal(entity))
=====================================

Note in the example the entity must be an instance of Raider
```

- `void avoidEntity(int priority, Class<E extends LivingEntity> entityClassToAvoid, Predicate<LivingEntity> avoidPredicate, float maxDist, double walkSpeedModifier, double sprintSpeedModifier, Predicate<LivingEntity> onAvoidEntityPredicate)`

  Parameters:
  - priority: int- The priority of the goal
  - entityClassToAvoid: Class<E extends LivingEntity>- The class of entity to avoid
  - avoidPredicate: Predicate<LivingEntity>- The conditions under which an entity will be avoided
  - maxDist: float- The maximum distance from a entity the mob will detect and flee from it
  - walkSpeedModifier: double- Modifies the mob's speed when avoiding an entity
  - sprintSpeedModifier: double- Modifies the mob's speed when avoiding an entity at close range
  - onAvoidEntityPredicate: Predicate<LivingEntity>- An additional predicate for entity avoidance

```
Adds a `AvoidEntityGoal` to the entity, only applicable to **pathfinder** mobs
```

- `void breed(int priority, double speedModifier, Class<? extends Animal> partnerClass)`

  Parameters:
  - priority: int- The priority of the goal
  - speedModifier: double- Sets the speed at which the mob should try to move
  - partnerClass: Class<? extends Animal>- The class of animal that this entity breeds with, may be null to specify it be the same class as this entity

```
Adds a `BreedGoal` to the entity, only applicable to **animal** mobs
```

- `void breathAir(int priority)`

  Parameters:
  - priority: int- The priority of the goal

```
Adds a `BreathAirGoal` to the entity, only applicable to **pathfinder** mobs
```

- `void breakDoor(int priority, int doorBreakTime, Predicate<Difficulty> validDifficulties)`

  Parameters:
  - priority: int- The priority of the goal
  - doorBreakTime: int- The time it takes to break a door, limited to 240 ticks
  - validDifficulties: Predicate<Difficulty>- Determines what difficulties are valid for the goal

```
Adds a `BreakDoorGoal` to the entity
```

- `void floatSwim(int priority)`

  Parameters:
  - priority: int- The priority of the goal

```
Adds a `FloatGoal` to the entity
```

- `void removeBlock(int priority, ResourceLocation block, double speedModifier, int verticalSearchRange)`

  Parameters:
  - priority: int- The priority of the goal
  - block: ResourceLocation- The registry name of a block, the block to be removed
  - speedModifier: double- Sets the speed at which the mob should try to move
  - verticalSearchRange: int- The vertical range the mob will search for the block

```
Adds a `RemoveBlockGoal` to the entity, only applicable to **pathfinder** mobs
```

- `void meleeAttack(int priority, double speedModifier, boolean followTargetEventIfNotSeen)`

  Parameters:
  - priority: int- The priority of the goal
  - speedModifier: double- Sets the speed at which the mob should try to move
  - followTargetEventIfNotSeen: boolean- Determines if the entity should follow the target even if it doesn't see it

```
Adds a `MeleeAttackGoal` to the entity, only applicable to **pathfinder** mobs
```

- `void eatGrass(int priority)`

  Parameters:
  - priority: int- The priority of the goal

```
Adds a `EatBlockGoal` to the entity
```

- `void lookAtEntity(int priority, Class<E extends LivingEntity> targetClass, float lookDistance, float probability, boolean onlyHorizontal)`

  Parameters:
  - priority: int- The priority of the goal
  - targetClass: Class<E extends LivingEntity>- The entity class that should be looked at
  - lookDistance: float- How far away the entity should be looked at
  - probability: float- The probability, in the range [0, 1], that the goal may be used
  - onlyHorizontal: boolean- Determines if the eye level must be the same to follow the target entity

```
Adds a `LookAtPlayerGoal` to the entity
```

- `void followParent(int priority, double speedModifier)`

  Parameters:
  - priority: int- The priority of the goal
  - speedModifier: double- Sets the speed at which the mob should try to move

```
Adds a `FollowParentGoal` to the entity, only applicable to **animal** mobs
```

- `void followMob(int priority, double speedModifier, float stopDistance, float areaSize)`

  Parameters:
  - priority: int- The priority of the goal
  - speedModifier: double- Sets the speed at which the mob should try to move
  - stopDistance: float- The distance away from the target the mob will stop
  - areaSize: float- The distance away from the mob, that will be searched for mobs to follow

```
Adds a `FollowMobGoal` to the entity
```

- `void fleeSun(int priority, double speedModifier)`

  Parameters:
  - priority: int- The priority of the goal
  - speedModifier: double- Sets the speed at which the mob should try to move

```
Adds a `FleeSunGoal` to the entity, only applicable to **pathfinder** mobs
```

- `void followBoat(int priority)`

  Parameters:
  - priority: int- The priority of the goal

```
Adds a `FollowBoatGoal` to the entity, only applicable to **pathfinder** mobs
```

- `void followOwner(int priority, double speedModifier, float startDistance, float stopDistance, boolean canFly)`

  Parameters:
  - priority: int- The priority of the goal
  - speedModifier: double- Sets the speed at which the mob should try to move
  - startDistance: float- The distance away from the owner the mob will start moving
  - stopDistance: float- The distance away from the owner the mob will stop moving
  - canFly: boolean- If the mob can teleport into leaves

```
Adds a `FollowOwnerGoal` to the entity, only applicable to **tamable** mobs
```

- `void moveBackToVillage(int priority, double speedModifier, boolean checkNoActionTime)`

  Parameters:
  - priority: int- The priority of the goal
  - speedModifier: double- Sets the speed at which the mob should try to move
  - checkNoActionTime: boolean- Determines if the mob's noActionTime property should be checked

```
Adds a `MoveBackToVillageGoal` to the entity, only applicable to **pathfinder** mobs
```

- `void moveTowardsTarget(int priority, double speedModifier, float distanceWithin)`

  Parameters:
  - priority: int- The priority of the goal
  - speedModifier: double- Sets the speed at which the mob should try to move
  - distanceWithin: float- The distance the target must be within to move towards it

```
Adds a `MoveTowardsTargetGoal` to the entity, only applicable to **pathfinder** mobs
```

- `void randomStroll(int priority, double speedModifier, int interval, boolean checkNoActionTime)`

  Parameters:
  - priority: int- The priority of the goal
  - speedModifier: double- Sets the speed at which the mob should try to move
  - interval: int- Sets the interval at which the goal will be 'refreshed, any values below 1 will be 1.'
  - checkNoActionTime: boolean- Determines if the mob's noActionTime property should be checked

```
Adds a `RandomStrollGoal` to the entity, only applicable to **pathfinder** mobs
```

- `void openDoor(int priority, boolean closeDoor)`

  Parameters:
  - priority: int- The priority of the goal
  - closeDoor: boolean- If the entity should also close doors

```
Adds a `OpenDoorGoal` to the entity
```

- `void ocelotAttack(int priority)`

  Parameters:
  - priority: int- The priority of the goal

```
Adds a `OcelotAttackGoal` to the entity
```

- `void moveThroughVillage(int priority, double speedModifier, boolean onlyAtNight, int distanceToPoi, Supplier<Boolean> canDealWithDoors)`

  Parameters:
  - priority: int- The priority of the goal
  - speedModifier: double- Sets the speed at which the mob should try to move
  - onlyAtNight: boolean- If this goal should only apply at night
  - distanceToPoi: int- The minimum distance to a poi the mob must be to have it be considered 'visited'
  - canDealWithDoors: Supplier<Boolean>- If doors can be opened to navigate as part of this goal

```
Adds a `MoveThroughVillageGoal` to the entity, only applicable to **pathfinder** mobs
```

- `void leapAtTarget(int priority, float deltaY)`

  Parameters:
  - priority: int- The priority of the goal
  - deltaY: float- Sets the delta movement of the animal in the y-axis

```
Adds a `LeapAtTargetGoal` to the entity
```

- `void randomLookAround(int priority)`

  Parameters:
  - priority: int- The priority of the goal

```
Adds a `RandomLookAroundGoal` to the entity
```

- `void restrictSun(int priority)`

  Parameters:
  - priority: int- The priority of the goal

```
Adds a `RestrictSunGoal` to the entity, only applicable to **pathfinder** mobs
```

- `void rangedAttack(int priority, double speedModifier, int attackIntervalMin, int attackIntervalMax, float attackRadius)`

  Parameters:
  - priority: int- The priority of the goal
  - speedModifier: double- Sets the speed at which the mob should try to move
  - attackIntervalMin: int- The minimum interval between attacks
  - attackIntervalMax: int- The maximum interval between attacks
  - attackRadius: float- The maximum distance something can be attacked from

```
Adds a `RangedAttackGoal` to the entity, only applicable to **ranged attack** mobs
```

- `void tempt(int priority, double speedModifier, Ingredient temptItems, boolean canScare)`

  Parameters:
  - priority: int- The priority of the goal
  - speedModifier: double- Sets the speed at which the mob should try to move
  - temptItems: Ingredient- The ingredient that determines what items tempt the mob
  - canScare: boolean- If the mob can be scared by getting to close to the tempter

```
Adds a `TemptGoal` to the entity, only applicable to **pathfinder** mobs
```

- `void tryFindWater(int priority)`

  Parameters:
  - priority: int- The priority of the goal

```
Adds a `TryFindWaterGoal` to the entity, only applicable to **pathfinder** mobs
```

- `void useItem(int priority, ItemStack itemToUse, ResourceLocation soundEvent, Predicate<T extends Mob> canUseSelector)`

  Parameters:
  - priority: int- The priority of the goal
  - itemToUse: ItemStack- The item that will be used
  - soundEvent: ResourceLocation- The registry name of a sound event that should play when the item is used, may be null to indicate not sound event should play
  - canUseSelector: Predicate<T extends Mob>- Determines when the item may be used

```
Adds a `UseItemGoal` to the entity
```

- `void sitWhenOrdered(int priority)`

  Parameters:
  - priority: int- The priority of the goal

```
Adds a `SitWhenOrderedToGoal` to the entity, only applicable to **tamable** mobs
```

- `void randomSwimming(int priority, double speedModifier, int interval)`

  Parameters:
  - priority: int- The priority of the goal
  - speedModifier: double- Sets the speed at which the mob should try to move
  - interval: int- Sets the interval at which the goal will be refreshed

```
Adds a `RandomSwimmingGoal` to the entity, only applicable to **pathfinder** mobs
```

- `void panic(int priority, double speedModifier)`

  Parameters:
  - priority: int- The priority of the goal
  - speedModifier: double- Sets the speed at which the mob should try to move

```
Adds a `PanicGoal` to the entity, only applicable to **pathfinder** mobs
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
EntityJSEvents.addGoalSelectors(extra_id, (event) => {
	// This space (un)intentionally left blank
});
```

