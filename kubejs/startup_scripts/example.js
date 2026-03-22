let Zombie = Java.loadClass("net.minecraft.world.entity.monster.Zombie")
StartupEvents.registry("entity_type", event => {
    event.createCustom("wyrm", Zombie, modifyBuilder => {})
        .sized(1, 1)
        .addAnimationController('exampleController', 1, controllerEvent => {
            controllerEvent.addTriggerableAnimation('spawn', 'spawning', 'default');
            if (controllerEvent.entity.originalEntity.hurtTime > 0) {
            } else {
                controllerEvent.thenLoop('idle');
            }
            return true;
        })
        .textureResource(entity => {
            if (entity.originalEntity.hurtTime > 0) {
                entity.triggerAnimation('exampleController', 'spawning')
            }
            return "kubejs:textures/entity/alice.png"
        })
        .scaleModelForRender(context => {
            const { entity, widthScale, heightScale, poseStack, model, isReRender, partialTick, packedLight, packedOverlay } = context
            poseStack.scale(0.5, 0.5, 0.5)
        })
        .modelResource(entity => {
            return "kubejs:geo/alice.geo.json";
        })
})