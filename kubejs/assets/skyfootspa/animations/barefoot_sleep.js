// ============================================================
// TLM 包内自定义 JS 动画：睡眠赤脚（随腿跟随版）
// ------------------------------------------------------------
// 加载契约（CustomJsAnimationManger）：
//   路径 assets/<namespace>/<path>，Nashorn eval 返回最后一个表达式，
//   即末尾的 barefootSleep 对象。
// 调用契约（BedrockModel.setupMaidAnim）：
//   invokeMethod(obj, "animation", maid, limbSwing, limbSwingAmount,
//                ageInTicks, netHeadYaw, headPitch, scaleFactor, modelMap)
//   注意：方法名必须是 animation；maid（EntityMaidWrapper）是第 1 参，
//   modelMap（HashMap<String, ModelRendererWrapper>）是最后 1 参。
// 安全要求：函数体绝不能抛异常——setupMaidAnim 捕获后会调用
//   removeAnimation 把该模型的整个动画列表摘除（走路动画会一起消失）。
// 配套几何：bareFootLeft/bareFootRight 分别挂在 legLeft/legRight 下，
//   随腿部动作一起运动；睡眠时显示（盖住鞋像素=赤脚），平时隐藏。
// ============================================================
var barefootSleep = {
    animation: function (maid, limbSwing, limbSwingAmount, ageInTicks, netHeadYaw, headPitch, scaleFactor, modelMap) {
        try {
            var sleeping = maid.isSleep();
            var left = modelMap.get("bareFootLeft");
            if (left != null) {
                left.setHidden(!sleeping);
            }
            var right = modelMap.get("bareFootRight");
            if (right != null) {
                right.setHidden(!sleeping);
            }
        } catch (e) {
            // 吞掉一切异常，避免触发 removeAnimation
        }
    }
};
barefootSleep;
