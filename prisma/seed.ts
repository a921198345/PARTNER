import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('开始填充数据...');

  // 创建科目
  const subjects = await Promise.all([
    prisma.subject.create({
      data: {
        name: '考公'
      }
    }),
    prisma.subject.create({
      data: {
        name: '教资'
      }
    }),
    prisma.subject.create({
      data: {
        name: '法考'
      }
    })
  ]);
  
  console.log('科目创建完成');

  // 创建科目子类别
  const civilSubCategory = await prisma.subCategory.create({
    data: {
      name: '民法',
      subjectId: subjects[2].id,
    }
  });

  const criminalSubCategory = await prisma.subCategory.create({
    data: {
      name: '刑法',
      subjectId: subjects[2].id,
    }
  });

  const adminSubCategory = await prisma.subCategory.create({
    data: {
      name: '行政法',
      subjectId: subjects[2].id,
    }
  });
  
  console.log('科目子类别创建完成');

  // 创建AI角色
  const aiCharacters = await Promise.all([
    prisma.aICharacter.create({
      data: {
        name: '小雨',
        description: '温柔贴心的学习助手',
        gender: '女',
        type: '温柔型',
        avatarUrl: '/images/avatars/female-1.png',
      },
    }),
    prisma.aICharacter.create({
      data: {
        name: '小智',
        description: '严谨专业的学习导师',
        gender: '男',
        type: '专业型',
        avatarUrl: '/images/avatars/male-1.png',
      },
    }),
    prisma.aICharacter.create({
      data: {
        name: '晓风',
        description: '活泼开朗的学习伙伴',
        gender: '女',
        type: '活泼型',
        avatarUrl: '/images/avatars/female-2.png',
      },
    }),
  ]);
  
  console.log('AI角色创建完成');

  // 创建演示用户
  const demoUser = await prisma.user.create({
    data: {
      name: '测试用户',
      email: 'test@example.com',
      password: await hash('password123', 10),
      subjectId: subjects[2].id, // 法考
      aiCharacterId: aiCharacters[0].id, // 小雨
      aiCustomName: '小助手',
      userNickname: '学习者',
      dailyStudyGoal: 2.5, // 每日学习2.5小时
    },
  });
  
  console.log('测试用户创建完成');

  // 创建知识库内容
  await prisma.knowledgeBase.create({
    data: {
      title: '行政法基础知识',
      content: `
# 行政法概述

行政法是规范行政主体在行使行政职权过程中与行政相对人之间所发生的各种关系的法律规范的总称。

## 行政法的特征

1. 行政法调整的是行政法律关系
2. 行政法的主体一方必须是行政主体
3. 行政法规范体现国家意志，具有国家强制力

## 行政主体

行政主体是指依法享有行政职权，能够以自己的名义行使行政职权并独立承担法律责任的组织。包括：

- 国家行政机关（如国务院、地方各级人民政府等）
- 法律法规授权的组织（如村民委员会等）
- 行政委托组织

## 行政行为

行政行为是行政主体在行政管理过程中行使行政职权，意图产生法律效果的行为。分为：

- 抽象行政行为
- 具体行政行为
      `,
      subjectId: subjects[2].id,
      subCategoryId: adminSubCategory.id
    }
  });
  
  console.log('知识库内容创建完成');

  // 创建考试和题目
  const exam = await prisma.exam.create({
    data: {
      title: '2023年法律职业资格考试真题',
      description: '2023年法律职业资格考试客观题真题',
      year: 2023,
      subjectId: subjects[2].id,
      subCategoryId: civilSubCategory.id,
    }
  });

  // 创建题目
  await prisma.question.create({
    data: {
      examId: exam.id,
      content: '根据《民法典》，关于夫妻共同财产，下列说法正确的是：',
      options: JSON.stringify([
        'A. 夫妻一方婚前取得的财产，婚后由双方共同管理、使用的，视为夫妻共同财产',
        'B. 夫妻一方因受到人身损害获得的赔偿或者补偿，属于夫妻共同财产',
        'C. 夫妻对共同财产不能约定归各自所有',
        'D. 夫妻一方的婚前财产，可以约定为夫妻共同财产'
      ]),
      correctAnswer: 'D',
      explanation: '《民法典》第1062条规定，夫妻可以约定婚姻关系存续期间所得的财产以及婚前财产归各自所有、共同所有或者部分各自所有、部分共同所有。约定应当采用书面形式。故D选项正确。',
      knowledgePoints: JSON.stringify(['民法', '婚姻家庭', '财产关系'])
    }
  });

  await prisma.question.create({
    data: {
      examId: exam.id,
      content: '关于代理权的消灭，下列说法错误的是：',
      options: JSON.stringify([
        'A. 代理人丧失民事行为能力，代理权消灭',
        'B. 代理人或者被代理人死亡，代理权消灭',
        'C. 被代理人丧失民事行为能力，代理权消灭',
        'D. 授权委托书确定的代理期间届满，代理权消灭'
      ]),
      correctAnswer: 'C',
      explanation: '《民法典》第174条规定，有下列情形之一的，委托代理终止：（一）代理期间届满或者代理事务完成；（二）被代理人取消委托或者代理人辞去委托；（三）代理人丧失民事行为能力；（四）代理人或者被代理人死亡；（五）作为代理人或者被代理人的法人、非法人组织终止。因此，C项说法错误。',
      knowledgePoints: JSON.stringify(['民法', '代理', '代理权消灭'])
    }
  });
  
  console.log('考试和题目创建完成');

  // 为用户创建学习目标
  await prisma.studyGoal.create({
    data: {
      userId: demoUser.id,
      title: '完成民法学习',
      description: '掌握民法基本概念和案例分析',
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
      completed: false,
    },
  });
  
  console.log('学习目标创建完成');

  // 为用户创建学习记录
  await prisma.studyRecord.create({
    data: {
      userId: demoUser.id,
      date: new Date(),
      duration: 2.5,
      websites: 'law.com,study.com',
      completed: true,
    },
  });
  
  console.log('学习记录创建完成');

  console.log('数据填充完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 