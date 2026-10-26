import catalog from "@/data/recipes.json";

export type Goal = "clean_bulk" | "fast_bulk" | "fat_loss" | "cutting" | "maintenance" | "recomp" | "performance" | "custom";
export type Meal = "breakfast" | "lunch" | "snack" | "dinner";
export type Ingredient = {name:string; nameRu:string; amount:string; category:string};
export type Recipe = {id:string; title:string; sourceTitle:string; image:string; meal:Meal; calories:number; protein:number; fat:number; carbs:number; fiber:number; cost:number; time:number; difficulty:string; cuisine:string; equipment:string[]; ingredients:Ingredient[]; allergens:string[]; vegetarian:boolean; vegan:boolean; halalIngredients:boolean; steps:{text:string;seconds:number}[];originalDirections:string[]};
export const RECIPES = catalog as Recipe[];
export const BY_ID = Object.fromEntries(RECIPES.map(r=>[r.id,r])) as Record<string,Recipe>;
export const GOALS:{id:Goal;label:string;description:string}[]=[
  {id:"clean_bulk",label:"Clean bulk",description:"Мягкий профицит для набора массы"},
  {id:"fast_bulk",label:"Fast bulk",description:"Более быстрый набор без строгого ограничения жиров"},
  {id:"fat_loss",label:"Fat loss",description:"Умеренный дефицит и сытное меню"},
  {id:"cutting",label:"Cutting",description:"Больше белка при сниженной калорийности"},
  {id:"maintenance",label:"Maintenance",description:"Удержание веса в привычном ритме"},
  {id:"recomp",label:"Body recomposition",description:"Баланс для тренировок и изменения состава тела"},
  {id:"performance",label:"Performance",description:"Больше энергии для активных тренировок"},
  {id:"custom",label:"Своя цель",description:"Настрой калории и макросы вручную"},
];
export const MEAL_LABEL:Record<Meal,string>={breakfast:"Завтрак",lunch:"Обед",snack:"Перекус",dinner:"Ужин"};
export const CUISINE_RU:Record<string,string>={Italian:"Итальянская",British:"Британская",Greek:"Греческая",American:"Американская",Indian:"Индийская",French:"Французская",Chinese:"Китайская",Japanese:"Японская",Turkish:"Турецкая",Spanish:"Испанская",Vietnamese:"Вьетнамская",Mediterranean:"Средиземноморская",Norwegian:"Норвежская",Russian:"Русская",Mexican:"Мексиканская",Dutch:"Нидерландская",Moroccan:"Марокканская",Egyptian:"Египетская",Thai:"Тайская"};
export const TASTE_OPTIONS=["курица","лосось","тунец","говядина","яйца","творог","йогурт","паста","рис","картофель","овощи","фрукты","выпечка","азиатская кухня","итальянская кухня","средиземноморская кухня","казахская кухня","турецкая кухня","немецкая кухня"];
export const DIETS=["Обычное","Вегетарианское","Веганское","Халяль (по составу)","Без лактозы","Без глютена"];
export const EQUIPMENT=["Плита","Духовка","Аэрогриль","Микроволновка","Блендер"];
export const ALLERGENS=["Молоко","Яйца","Глютен","Рыба","Морепродукты","Орехи","Кунжут","Соя"];
export const REASONS=["Не люблю ингредиент","Слишком долго готовить","Слишком дорого","Слишком тяжёлое блюдо","Слишком маленькая порция","Не подходит по текстуре","Просто не хочется сегодня"];
export const SWAP_MODES=["Быстрее","Дешевле","Больше белка","Меньше калорий","Без ингредиента","Из холодильника","Удиви меня"] as const;
export type SwapMode=typeof SWAP_MODES[number];
export type Targets={calories:number;protein:number;fat:number;carbs:number;fiber:number};
export type Profile={name:string;age:number;sex:"female"|"male";height:number;weight:number;targetWeight:number;activity:"low"|"moderate"|"high";workouts:number;sport:string;steps:number;pace:"slow"|"moderate"|"fast";goal:Goal;budgetDay:number;budgetWeek:number;weekdayMinutes:number;weekendMinutes:number;cooksPerWeek:number;mealPrep:boolean;mealCount:number;snacks:boolean;preWorkoutSweet:boolean;repeatMeals:boolean;diet:string;equipment:string[];allergies:string[];disliked:string[];pantry:string[];customTargets:Targets|null};
export type PlanItem={key:string;recipeId:string;servings:number;eaten:boolean;locked:boolean};
export type WeightLog={date:string;weight:number};
export type AppState={profile:Profile;tastes:Record<string,number>;reactions:Record<string,number>;reasons:Record<string,string>;favorites:string[];ratings:Record<string,number>;reviews:Record<string,string>;plans:Record<string,PlanItem[]>;water:Record<string,number>;weights:WeightLog[];purchased:string[];shoppingRemoved:string[];shoppingQty:Record<string,number>;extraShopping:string[];prepDays:string[];cookMinutes:number;onboarded:boolean};

const ROUND=(n:number)=>Math.round(n);
export const todayKey=()=>localDateKey(new Date());
export function localDateKey(date:Date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;}
export function weekDates(reference=new Date()){const first=new Date(reference.getFullYear(),reference.getMonth(),reference.getDate());first.setDate(first.getDate()-((first.getDay()+6)%7));return Array.from({length:7},(_,i)=>{const d=new Date(first);d.setDate(first.getDate()+i);return localDateKey(d)});}
export const formatDate=(key:string,options?:Intl.DateTimeFormatOptions)=>new Intl.DateTimeFormat("ru-RU",options??{day:"numeric",month:"long"}).format(new Date(`${key}T12:00:00`));
export function calculateTargets(p:Profile):Targets{
  const bmr=10*p.weight+6.25*p.height-5*p.age+(p.sex==="male"?5:-161);
  const factor={low:1.28,moderate:1.5,high:1.72}[p.activity]+Math.min(p.workouts,7)*0.025+Math.max(0,p.steps-6000)/100000;
  const base=bmr*factor;
  const pace={slow:0.65,moderate:1,fast:1.3}[p.pace];
  const offset:Record<Goal,number>={clean_bulk:220,fast_bulk:430,fat_loss:-320,cutting:-440,maintenance:0,recomp:-80,performance:230,custom:0};
  const calories=ROUND(Math.max(p.sex==="female"?1250:1500,base+offset[p.goal]*pace));
  const protein=ROUND(p.weight*(p.goal==="cutting"||p.goal==="recomp"?2:1.75));
  const fat=ROUND(Math.max(40,calories*0.27/9));
  const carbs=ROUND(Math.max(60,(calories-protein*4-fat*9)/4));
  return {calories,protein,fat,carbs,fiber:ROUND(Math.max(25,calories/80))};
}
export const targets=(p:Profile)=>p.customTargets??calculateTargets(p);
export function defaultProfile():Profile{return {name:"Александра",age:27,sex:"female",height:170,weight:65,targetWeight:68,activity:"moderate",workouts:4,sport:"Силовые тренировки",steps:8500,pace:"slow",goal:"clean_bulk",budgetDay:18,budgetWeek:126,weekdayMinutes:35,weekendMinutes:60,cooksPerWeek:5,mealPrep:true,mealCount:4,snacks:true,preWorkoutSweet:false,repeatMeals:true,diet:"Обычное",equipment:["Плита","Духовка","Блендер"],allergies:[],disliked:[],pantry:["рис","яйца","лук"],customTargets:null};}
export const defaultTastes:Record<string,number>={курица:1,лосось:1,яйца:1,рис:1,овощи:1,"итальянская кухня":1,тунец:-1};
export function createInitialState():AppState{
  const profile=defaultProfile(),tastes={...defaultTastes};
  const state:AppState={profile,tastes,reactions:{},reasons:{},favorites:[],ratings:{},reviews:{},plans:{},water:{},weights:[{date:localDateKey(new Date(Date.now()-14*86400000)),weight:64.3},{date:localDateKey(new Date(Date.now()-7*86400000)),weight:64.7},{date:todayKey(),weight:65}],purchased:[],shoppingRemoved:[],shoppingQty:{},extraShopping:[],prepDays:[],cookMinutes:0,onboarded:true};
  for(const date of weekDates()){state.plans[date]=buildDay(profile,tastes,{},[],date);}
  return state;
}
const containsIngredient=(recipe:Recipe,word:string)=>recipe.ingredients.some(i=>`${i.name} ${i.nameRu}`.toLowerCase().includes(word.toLowerCase()));
export function allowed(recipe:Recipe,p:Profile,tastes:Record<string,number>){
  if(recipe.allergens.some(a=>p.allergies.includes(a)))return false;
  if(p.disliked.some(word=>containsIngredient(recipe,word)))return false;
  if(Object.entries(tastes).some(([word,value])=>value===-2&&containsIngredient(recipe,word)))return false;
  if(p.diet==="Вегетарианское"&&!recipe.vegetarian)return false;
  if(p.diet==="Веганское"&&!recipe.vegan)return false;
  if(p.diet==="Халяль (по составу)"&&!recipe.halalIngredients)return false;
  if(p.diet==="Без лактозы"&&recipe.allergens.includes("Молоко"))return false;
  if(p.diet==="Без глютена"&&recipe.allergens.includes("Глютен"))return false;
  if(!recipe.equipment.some(tool=>p.equipment.includes(tool)))return false;
  return true;
}
export function score(recipe:Recipe,p:Profile,tastes:Record<string,number>,reactions:Record<string,number>,date=todayKey(),used:string[]=[]){
  if(!allowed(recipe,p,tastes))return -Infinity;
  let result=62+8*(reactions[recipe.id]??0);
  const hay=`${recipe.title} ${recipe.cuisine} ${recipe.ingredients.map(i=>i.nameRu).join(" ")}`.toLowerCase();
  for(const [taste,value] of Object.entries(tastes))if(value!==0&&hay.includes(taste.replace(" кухня","")))result+=value*8;
  if(p.pantry.some(word=>hay.includes(word.toLowerCase())))result+=5;
  const minutes=new Date(`${date}T12:00:00`).getDay()%6===0?p.weekendMinutes:p.weekdayMinutes;
  result-=Math.max(0,recipe.time-minutes)*1.8;
  result-=Math.max(0,recipe.cost-p.budgetDay/Math.max(3,p.mealCount))*3;
  if(used.includes(recipe.id))result-=p.repeatMeals?12:50;
  if(p.goal==="cutting"||p.goal==="fat_loss")result+=recipe.protein/10-recipe.calories/110;
  if(p.goal==="clean_bulk"||p.goal==="recomp")result+=recipe.protein/8;
  return result;
}
export function tasteMatch(recipe:Recipe,state:AppState){const value=score(recipe,state.profile,state.tastes,state.reactions);return Number.isFinite(value)?Math.max(25,Math.min(99,ROUND(value))):0;}
export function buildDay(p:Profile,tastes:Record<string,number>,reactions:Record<string,number>,used:string[],date:string):PlanItem[]{
  const mealTypes:Meal[]=p.mealCount<=3?["breakfast","lunch","dinner"]:p.mealCount===4?["breakfast","lunch",p.snacks?"snack":"lunch","dinner"]:["breakfast","snack","lunch","snack","dinner"];
  const dayTarget=targets(p).calories;
  const weight:Record<Meal,number>={breakfast:.26,lunch:.31,snack:.13,dinner:.30};
  const chosen:string[]=[];
  return mealTypes.map((meal,index)=>{
    const target=dayTarget*weight[meal]/(mealTypes.filter(m=>m===meal).length);
    const candidates=RECIPES.filter(r=>r.meal===meal&&allowed(r,p,tastes));
    const pool=candidates.length?candidates:RECIPES.filter(r=>allowed(r,p,tastes));
    const ranked=pool.map(r=>({r,s:score(r,p,tastes,reactions,date,[...used,...chosen])-Math.abs(r.calories-target)/45})).sort((a,b)=>b.s-a.s);
    const recipe=(ranked.find(({r})=>!chosen.includes(r.id))??ranked[0])?.r;
    if(!recipe)return {key:`${date}-${index}`,recipeId:"",servings:1,eaten:false,locked:false};
    chosen.push(recipe.id);
    return {key:`${date}-${index}`,recipeId:recipe.id,servings:1,eaten:false,locked:false};
  }).filter(item=>item.recipeId);
}
export function replaceChoice(item:PlanItem,mode:SwapMode,state:AppState,date:string,exclude=""){
  const old=BY_ID[item.recipeId];if(!old)return null;
  const used=(state.plans[date]??[]).map(i=>i.recipeId);
  const candidates=RECIPES.filter(r=>r.id!==old.id&&r.meal===old.meal&&allowed(r,state.profile,state.tastes)&&!used.includes(r.id)&&Math.abs(r.calories*item.servings-old.calories*item.servings)<=Math.max(160,old.calories*.27)&&(!exclude||!containsIngredient(r,exclude)));
  const ranked=candidates.map(r=>{let delta=0;if(mode==="Быстрее")delta=(old.time-r.time)*3;if(mode==="Дешевле")delta=(old.cost-r.cost)*12;if(mode==="Больше белка")delta=(r.protein-old.protein)*2;if(mode==="Меньше калорий")delta=(old.calories-r.calories)/4;if(mode==="Из холодильника")delta=state.profile.pantry.filter(w=>containsIngredient(r,w)).length*18;if(mode==="Удиви меня")delta=(r.id.charCodeAt(r.id.length-1)%8)*5;return {r,s:score(r,state.profile,state.tastes,state.reactions,date,used)+delta-Math.abs(r.calories-old.calories)/25};}).sort((a,b)=>b.s-a.s);
  return ranked[0]?.r??null;
}
export function sumPlan(items:PlanItem[]){return items.reduce((sum,item)=>{const r=BY_ID[item.recipeId];if(r){sum.calories+=r.calories*item.servings;sum.protein+=r.protein*item.servings;sum.fat+=r.fat*item.servings;sum.carbs+=r.carbs*item.servings;sum.fiber+=r.fiber*item.servings;sum.cost+=r.cost*item.servings;}return sum;},{calories:0,protein:0,fat:0,carbs:0,fiber:0,cost:0});}
export function parseAmount(source:string){const match=source.trim().match(/^(\d+(?:\.\d+)?)(?:\s+(\d+)\/(\d+)|\/(\d+))?\s*(.*)$/);if(!match)return {quantity:1,unit:source.trim()||"шт"};return {quantity:Number(match[1])+(match[2]?Number(match[2])/Number(match[3]):match[4]?1/Number(match[4]):0),unit:match[5].trim()||"шт"};}
export function ingredientAmount(amount:string,servings:number){const p=parseAmount(amount);const value=p.quantity*servings;return `${Number.isInteger(value)?value:Number(value.toFixed(2))} ${p.unit}`.trim();}
export type ShoppingEntry={key:string;name:string;category:string;quantity:number;unit:string;cost:number;owned:boolean};
export function shoppingList(state:AppState){const result=new Map<string,ShoppingEntry>();const items=[...weekDates().flatMap(date=>state.plans[date]??[]),...(state.extraShopping??[]).map((recipeId,index)=>({key:`extra-${index}`,recipeId,servings:1,eaten:false,locked:false}))];for(const item of items){const recipe=BY_ID[item.recipeId];if(!recipe)continue;for(const ing of recipe.ingredients){const {quantity,unit}=parseAmount(ing.amount);const key=`${ing.name.toLowerCase()}|${unit.toLowerCase()}`;const previous=result.get(key);if(previous){previous.quantity+=quantity*item.servings;previous.cost+=recipe.cost/recipe.ingredients.length*item.servings;}else result.set(key,{key,name:ing.nameRu,category:ing.category,quantity:quantity*item.servings,unit,cost:recipe.cost/recipe.ingredients.length*item.servings,owned:state.profile.pantry.some(x=>ing.nameRu.toLowerCase().includes(x.toLowerCase())||ing.name.toLowerCase().includes(x.toLowerCase()))});}}return [...result.values()].filter(x=>!state.shoppingRemoved.includes(x.key)).sort((a,b)=>a.category.localeCompare(b.category,"ru")||a.name.localeCompare(b.name,"ru"));}
