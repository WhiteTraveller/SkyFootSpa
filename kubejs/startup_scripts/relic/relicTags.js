// priority: 10

global.margueriteTags = {
    doll: {
        id: "marguerite:tag_doll",
        nameZH: "人偶",
        color: "yellow"
    },
    fabric: {
        id: "marguerite:tag_fabric",
        nameZH: "布制品",
        color: "gray"
    },
    metal: {
        id: "marguerite:tag_metal",
        nameZH: "金属制品",
        color: "white"
    },
    knife: {
        id: "marguerite:tag_knife",
        nameZH: "小刀",
        color: "blue"
    },
    perform: {
        id: "marguerite:tag_perform",
        nameZH: "演奏",
        color: "yellow"
    },
    mushroom: {
        id: "marguerite:tag_mushroom",
        nameZH: "蘑菇",
        color: "blue"
    },
    wooden: {
        id: "marguerite:tag_wooden",
        nameZH: "木制",
        color: "gold"
    },
    step: {
        id: "marguerite:tag_step",
        nameZH: "步",
        color: "green"
    },
    magic: {
        id: "marguerite:tag_magic",
        nameZH: "魔法",
        color: "light_purple"
    },
    artifact: {
        id: "marguerite:tag_artifact",
        nameZH: "人工制品",
        color: "aqua"
    },
    book: {
        id: "marguerite:tag_book",
        nameZH: "书",
        color: "dark_aqua"
    },
    conductive: {
        id: "marguerite:tag_conductive",
        nameZH: "导电",
        color: "red"
    }
}

global.getNineGrid = function (center, rows, cols) {
    // 验证输入
    if (center < 0 || center >= rows * cols) {
        throw new Error(`格子编号必须在 0-${rows * cols - 1} 之间`);
    }
    // 计算中心格子的行号和列号（从0开始）
    const centerRow = Math.floor(center / cols);
    const centerCol = center % cols;
    const result = [];
    let targetRow = 0;
    let targetCol = 0;
    let cellNumber = 0;
    // 遍历九宫格的3x3范围
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
            // 跳过中心格子 (0, 0偏移)
            if (rowOffset === 0 && colOffset === 0) {
                continue;
            }
            targetRow = centerRow + rowOffset;
            targetCol = centerCol + colOffset;
            // 检查是否在边界内
            if (targetRow >= 0 && targetRow < rows &&
                targetCol >= 0 && targetCol < cols) {
                // 计算格子编号
                cellNumber = targetRow * cols + targetCol;
                result.push(cellNumber);
            }
        }
    }
    return result;
}

global.getTenGrid = function (center, rows, cols) {
    // 验证输入
    if (center < 0 || center >= rows * cols) {
        throw new Error(`格子编号必须在 0-${rows * cols - 1} 之间`);
    }
    // 计算中心格子的行号和列号（从0开始）
    const centerRow = Math.floor(center / cols);
    const centerCol = center % cols;
    const result = [];
    let targetRow = 0;
    let targetCol = 0;
    let cellNumber = 0;

    targetRow = centerRow;
    targetCol = centerCol - 1;
    // 检查是否在边界内
    if (targetRow >= 0 && targetRow < rows &&
        targetCol >= 0 && targetCol < cols) {
        // 计算格子编号
        cellNumber = targetRow * cols + targetCol;
        result.push(cellNumber);
    }

    targetRow = centerRow;
    targetCol = centerCol + 1;
    if (targetRow >= 0 && targetRow < rows &&
        targetCol >= 0 && targetCol < cols) {
        cellNumber = targetRow * cols + targetCol;
        result.push(cellNumber);
    }

    targetRow = centerRow - 1;
    targetCol = centerCol;
    if (targetRow >= 0 && targetRow < rows &&
        targetCol >= 0 && targetCol < cols) {
        cellNumber = targetRow * cols + targetCol;
        result.push(cellNumber);
    }

    targetRow = centerRow + 1;
    targetCol = centerCol;
    if (targetRow >= 0 && targetRow < rows &&
        targetCol >= 0 && targetCol < cols) {
        cellNumber = targetRow * cols + targetCol;
        result.push(cellNumber);
    }

    return result;
}

global.checkIfInBottom = function (center, rows, cols) {
    // 验证输入
    if (center < 0 || center >= rows * cols) {
        throw new Error(`格子编号必须在 0-${rows * cols - 1} 之间`);
    }
    // 计算中心格子的行号和列号（从0开始）
    const centerRow = Math.floor(center / cols);
    const centerCol = center % cols;
    const result = [];
    let targetRow = 0;
    let targetCol = 0;
    let cellNumber = 0;
    // 遍历九宫格的3x3范围
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
            // 跳过中心格子 (0, 0偏移)
            if (rowOffset === 0 && colOffset === 0) {
                continue;
            }
            targetRow = centerRow + rowOffset;
            targetCol = centerCol + colOffset;
            // 检查是否在边界内
            if (targetRow >= 0 && targetRow < rows &&
                targetCol >= 0 && targetCol < cols) {
                // 计算格子编号
                cellNumber = targetRow * cols + targetCol;
                result.push(cellNumber);
            }
        }
    }
    return result;
}

global.confirmRelic = function (relicName, player) {
    //遍历所有遗物找到对应id后返回true，否则返回false
    let curiosHelper = curiosApi.getCuriosHelper();
    let curiosAll = curiosHelper.getEquippedCurios(player).resolve().get();
    for (let i = 0; i < 54; i++) {
        if (curiosAll.getStackInSlot(i).getId() == relicName) {
            return true;
        }
    }
    return false;
}