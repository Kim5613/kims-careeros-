const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const quotes = [
  // 华语经典
  { quote: '人得自个儿成全自个儿。', movie: '《霸王别姬》' },
  { quote: '不疯魔，不成活。', movie: '《霸王别姬》' },
  { quote: '说好的一辈子，差一年，一个月，一天，一个时辰，都不算一辈子。', movie: '《霸王别姬》' },
  { quote: '要想人前显贵，必得人后受罪。', movie: '《霸王别姬》' },
  { quote: '对不起，我是警察。', movie: '《无间道》' },
  { quote: '三年之后又三年，三年之后又三年，都快十年了老大！', movie: '《无间道》' },
  { quote: '我只想做个好人。', movie: '《无间道》' },
  { quote: '往往都是事情改变人，人改变不了事情。', movie: '《无间道》' },
  { quote: '出来混，迟早要还的。', movie: '《无间道》' },
  { quote: '每个人都会经过这个阶段，见到一座山，就想知道山后面是什么。', movie: '《东邪西毒》' },
  { quote: '当你不能够再拥有，你唯一可以做的，就是令自己不要忘记。', movie: '《东邪西毒》' },
  { quote: '酒越喝越暖，水越喝越寒。', movie: '《东邪西毒》' },
  { quote: '人最大的烦恼，就是记性太好。', movie: '《东邪西毒》' },
  { quote: '其实我是个演员。', movie: '《喜剧之王》' },
  { quote: '我养你啊！', movie: '《喜剧之王》' },
  { quote: '做人如果没有梦想，那跟咸鱼有什么分别？', movie: '《少林足球》' },
  { quote: '快点，我赶时间。', movie: '《少林足球》' },
  { quote: '我命由我不由天。', movie: '《哪吒之魔童降世》' },
  { quote: '人心中的成见就像一座大山，任你怎么努力也休想搬动。', movie: '《哪吒之魔童降世》' },
  { quote: '这世上只有一种病，穷病。', movie: '《我不是药神》' },
  { quote: '他才二十岁，他想活着，有什么罪？', movie: '《我不是药神》' },
  { quote: '让子弹飞一会儿。', movie: '《让子弹飞》' },
  { quote: '念念不忘，必有回响。', movie: '《一代宗师》' },
  { quote: '人生如棋，落子无悔。', movie: '《一代宗师》' },
  { quote: '如果记忆也是一个罐头的话，我希望这罐罐头不会过期。', movie: '《重庆森林》' },
  { quote: '不知道从什么时候开始，在什么东西上面都有个日期。', movie: '《重庆森林》' },
  { quote: '那些消逝了的岁月，仿佛隔着一块积着灰尘的玻璃，看得到，抓不着。', movie: '《花样年华》' },
  { quote: '如果多一张船票，你会不会跟我走？', movie: '《花样年华》' },
  { quote: '江湖里卧虎藏龙，人心里何尝不是？', movie: '《卧虎藏龙》' },
  { quote: '握紧拳头，你什么也没有；松开手，你才能拥有所有。', movie: '《卧虎藏龙》' },
  { quote: '有人的地方就有江湖。', movie: '《笑傲江湖之东方不败》' },
  { quote: '人就是江湖，你怎么退出？', movie: '《笑傲江湖之东方不败》' },
  { quote: '人生不能像做菜，等所有材料准备好了才下锅。', movie: '《饮食男女》' },
  { quote: '地主家也没有余粮啊。', movie: '《甲方乙方》' },
  { quote: '打死我也不说。', movie: '《甲方乙方》' },
  { quote: '做人呐，最重要的就是开心。', movie: '《家有喜事》' },
  { quote: '我不做大哥好多年。', movie: '《英雄本色》' },
  { quote: '我们虽然穷，但是不能说谎，也不能打人。', movie: '《长江七号》' },
  { quote: '一支穿云箭，千军万马来相见。', movie: '《功夫》' },
  { quote: '不赌不知时运到，不滚不知身体好。', movie: '《赌神》' },
  { quote: '我猜中了开头，却猜不中这结局。', movie: '《大话西游》' },
  { quote: '曾经有一份真挚的爱情摆在我面前，我没有珍惜。', movie: '《大话西游》' },
  { quote: '你看那个人，好奇怪哟，像一条狗。', movie: '《大话西游》' },
  { quote: '我听别人说这世界上有一种鸟是没有脚的。', movie: '《阿飞正传》' },
  { quote: '有些事现在不做，一辈子都不会做了。', movie: '《练习曲》' },
  { quote: '人如果没有了理想，那和无忧无虑有什么区别。', movie: '《后会无期》' },
  { quote: '做人要厚道。', movie: '《手机》' },
  { quote: '风往哪个方向吹，草就往哪个方向倒。', movie: '《艋舺》' },
  { quote: '你保护世界，我保护你。', movie: '《少年的你》' },
  { quote: '我宝儿，妈只希望你健康快乐。', movie: '《你好，李焕英》' },
  { quote: '下辈子咱俩必须得做母女。', movie: '《你好，李焕英》' },

  // 好莱坞
  { quote: "I'm going to make him an offer he can't refuse.", translation: '我会给他一个无法拒绝的条件。', movie: '《教父》' },
  { quote: "Frankly, my dear, I don't give a damn.", translation: '坦白说，亲爱的，我一点也不在乎。', movie: '《乱世佳人》' },
  { quote: "I'm king of the world!", translation: '我是世界之王！', movie: '《泰坦尼克号》' },
  { quote: 'You jump, I jump.', translation: '你跳，我就跳。', movie: '《泰坦尼克号》' },
  { quote: "I'll be back.", translation: '我会回来的。', movie: '《终结者》' },
  { quote: 'Hasta la vista, baby.', translation: '后会有期，宝贝。', movie: '《终结者2》' },
  { quote: 'May the Force be with you.', translation: '愿原力与你同在。', movie: '《星球大战》' },
  { quote: 'I am your father.', translation: '我是你父亲。', movie: '《星球大战：帝国反击战》' },
  { quote: 'With great power comes great responsibility.', translation: '能力越大，责任越大。', movie: '《蜘蛛侠》' },
  { quote: "Why so serious?", translation: '干嘛那么严肃？', movie: '《蝙蝠侠：黑暗骑士》' },
  { quote: "You can't handle the truth!", translation: '你承受不了真相！', movie: '《义海雄风》' },
  { quote: "Carpe diem. Seize the day, boys.", translation: '及时行乐，把握今天。', movie: '《死亡诗社》' },
  { quote: "I see dead people.", translation: '我能看见死人。', movie: '《第六感》' },
  { quote: "Houston, we have a problem.", translation: '休斯顿，我们遇到麻烦了。', movie: '《阿波罗13号》' },
  { quote: "There's no place like home.", translation: '没有什么地方比得上家。', movie: '《绿野仙踪》' },
  { quote: "You talking to me?", translation: '你在跟我说话？', movie: '《出租车司机》' },
  { quote: "Bond. James Bond.", translation: '邦德。詹姆斯·邦德。', movie: '《007》' },
  { quote: "You shall not pass!", translation: '你休想过去！', movie: '《指环王》' },
  { quote: "Not all who wander are lost.", translation: '并非所有漂泊者都迷失了方向。', movie: '《指环王》' },
  { quote: "My precious.", translation: '我的宝贝。', movie: '《指环王》' },
  { quote: "There is no spoon.", translation: '根本就没有勺子。', movie: '《黑客帝国》' },
  { quote: "I feel the need—the need for speed!", translation: '我感受到了对速度的需要！', movie: '《壮志凌云》' },
  { quote: "Here's looking at you, kid.", translation: '永志不忘，亲爱的。', movie: '《卡萨布兰卡》' },
  { quote: "Keep your friends close, but your enemies closer.", translation: '亲近朋友，更要亲近敌人。', movie: '《教父2》' },
  { quote: "Leave the gun. Take the cannoli.", translation: '把枪留下，把奶油卷带走。', movie: '《教父》' },
  { quote: "Here's Johnny!", translation: '强尼来了！', movie: '《闪灵》' },
  { quote: "As you wish.", translation: '如你所愿。', movie: '《公主新娘》' },
  { quote: "I see you.", translation: '我看见你了。', movie: '《阿凡达》' },
  { quote: "I am Groot.", translation: '我是格鲁特。', movie: '《银河护卫队》' },
  { quote: "I am Iron Man.", translation: '我是钢铁侠。', movie: '《钢铁侠》' },
  { quote: 'I love you 3000.', translation: '我爱你三千遍。', movie: '《复仇者联盟4》' },
  { quote: "I can do this all day.", translation: '我可以打一整天。', movie: '《美国队长》' },
  { quote: "Wakanda forever!", translation: '瓦坎达万岁！', movie: '《黑豹》' },
  { quote: "To infinity and beyond!", translation: '飞向宇宙，浩瀚无垠！', movie: '《玩具总动员》' },
  { quote: "Life is like a box of chocolates.", translation: '人生就像一盒巧克力。', movie: '《阿甘正传》' },
  { quote: "Elementary, my dear Watson.", translation: '很简单，我亲爱的华生。', movie: '《福尔摩斯》' },
  { quote: "After all, tomorrow is another day!", translation: '毕竟，明天又是新的一天！', movie: '《乱世佳人》' },
  { quote: "I'll have what she's having.", translation: '我要点和她一样的。', movie: '《当哈利遇到莎莉》' },
  { quote: "You had me at hello.", translation: '你开口说第一句话，就已经抓住我了。', movie: '《甜心先生》' },
  { quote: "Say hello to my little friend!", translation: '跟我的小朋友打个招呼吧！', movie: '《疤面煞星》' },

  // 动画
  { quote: 'The flower that blooms in adversity is the most rare and beautiful of all.', translation: '逆境中绽放的花朵，才是最稀有、最美丽的。', movie: '《花木兰》' },
  { quote: 'Remember who you are.', translation: '记住你是谁。', movie: '《狮子王》' },
  { quote: 'Hakuna Matata! It means no worries for the rest of your days.', translation: '哈库纳马塔塔！余生无忧无虑。', movie: '《狮子王》' },
  { quote: 'Let it go, let it go!', translation: '随它吧，随它吧！', movie: '《冰雪奇缘》' },
  { quote: 'Some people are worth melting for.', translation: '有些人值得你为他融化。', movie: '《冰雪奇缘》' },
  { quote: "You've got a friend in me.", translation: '我是你的好朋友。', movie: '《玩具总动员》' },
  { quote: 'Adventure is out there!', translation: '冒险就在前方！', movie: '《飞屋环游记》' },
  { quote: 'Thanks for the adventure. Now go have a new one!', translation: '谢谢你陪我冒险，现在去开启新的篇章吧！', movie: '《飞屋环游记》' },
  { quote: "I don't want to survive. I want to live.", translation: '我不只是想生存，我想要真正地生活。', movie: '《机器人总动员》' },
  { quote: 'Just keep swimming.', translation: '只管继续游下去。', movie: '《海底总动员》' },
  { quote: 'Anyone can cook.', translation: '任何人都能成为厨师。', movie: '《美食总动员》' },
  { quote: 'Nothing is more important than family.', translation: '没有什么比家人更重要。', movie: '《寻梦环游记》' },
  { quote: "I never look back, darling. It distracts from the now.", translation: '我从不回头看，那会分散对当下的注意力。', movie: '《超人总动员》' },
  { quote: 'Take her to the moon for me.', translation: '替我把她带到月球上去。', movie: '《头脑特工队》' },
  { quote: "Ogres are like onions. They have layers.", translation: '怪物就像洋葱，是有层次的。', movie: '《怪物史瑞克》' },
  { quote: "When you're feeling terrified, that's when you can be brave.", translation: '当你恐惧的时候，正是你可以勇敢的时候。', movie: '《疯狂动物城》' },
  { quote: 'Tale as old as time, true as it can be.', translation: '如时光般古老的故事，真实如斯。', movie: '《美女与野兽》' },

  // 日本电影/动画
  { quote: '一度あったことは忘れないものさ。思い出せないだけで。', translation: '曾经发生过的事不会忘记，只是想不起来而已。', movie: '《千与千寻》' },
  { quote: 'さようなら、ありがとう。また会おう。', translation: '再见，谢谢你。我们还会再见的。', movie: '《千与千寻》' },
  { quote: '夢だけど、夢じゃなかった。', translation: '虽然是梦，但又不是梦。', movie: '《龙猫》' },
  { quote: '笑おう。そうすれば、怖いものは逃げていく。', translation: '笑一笑吧，这样可怕的东西就会逃走了。', movie: '《龙猫》' },
  { quote: '生きろ。そなたは美しい。', translation: '活下去。你很美。', movie: '《幽灵公主》' },
  { quote: '心って重いよね。', translation: '心，是很沉重的呢。', movie: '《哈尔的移动城堡》' },
  { quote: '自分の名を忘れないで。', translation: '不要忘记自己的名字。', movie: '《千与千寻》' },
  { quote: '飛べない魔女もいるんだよ。', translation: '也有不会飞的魔女呢。', movie: '《魔女宅急便》' },
  { quote: '風立ちぬ、いざ生きめやも。', translation: '起风了，要努力活下去。', movie: '《起风了》' },
  { quote: '人は誰でも、幸せになる権利がある。', translation: '无论谁都有获得幸福的权利。', movie: '《哈尔的移动城堡》' },

  // 韩国电影
  { quote: '우린 모두 처음이잖아. 실수해도 괜찮아.', translation: '我们都是第一次，犯错也没关系。', movie: '《寄生虫》' },
  { quote: '사람은 변하지 않아. 상황이 사람을 바꾸는 거야.', translation: '人不会改变，是环境改变了人。', movie: '《燃烧》' },
  { quote: '용서하는 게 가장 어려운 일이야.', translation: '原谅是最难的事。', movie: '《老男孩》' },

  // 法国电影
  { quote: "Sans toi, les émotions d'aujourd'hui ne seraient que la peau morte des émotions d'autrefois.", translation: '没有你，良辰美景更与何人说。', movie: '《天使爱美丽》' },
  { quote: "La vie, c'est comme une boîte de chocolat.", translation: '人生就像一盒巧克力。', movie: '《无法触碰》' },
  { quote: "C'est la vie.", translation: '这就是人生。', movie: '《放牛班的春天》' },

  // 意大利电影
  { quote: 'Non arrenderti mai, perché quando pensi che sia tutto finito, è il momento in cui tutto ha inizio.', translation: '永远不要放弃，因为当你觉得一切都结束了的时候，正是一切开始的时候。', movie: '《海上钢琴师》' },
  { quote: "La vita è bella.", translation: '生活是美好的。', movie: '《美丽人生》' },
  { quote: 'Buongiorno, principessa!', translation: '早安，公主！', movie: '《美丽人生》' },

  // 印度电影
  { quote: 'All is well.', translation: '一切安好。', movie: '《三傻大闹宝莱坞》' },
  { quote: '追求卓越，成功就会在不经意间追上你。', translation: '追求卓越，成功就会在不经意间追上你。', movie: '《三傻大闹宝莱坞》' },

  // 西班牙语电影
  { quote: 'La vida no es la que uno vivió, sino la que uno recuerda.', translation: '人生不是你活过的日子，而是你记住的日子。', movie: '《潘神的迷宫》' },
  { quote: 'Házlo, o no lo hagas. Pero no lo intentes.', translation: '要么做，要么不做，没有尝试一说。', movie: '《星球大战》（西语版）' },
];

async function seed() {
  // 清空旧数据
  await prisma.movieQuote.deleteMany();
  console.log('Cleared old quotes');

  // 插入新数据
  for (const q of quotes) {
    await prisma.movieQuote.create({
      data: {
        quote: q.quote,
        translation: q.translation || null,
        movie: q.movie,
      },
    });
  }
  console.log(`Seeded ${quotes.length} quotes`);
  await prisma.$disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
