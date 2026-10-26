"use client";
import {useMemo,useState} from "react";
import {ChefHat,Clock3,Heart,Search,SlidersHorizontal,Sparkles,ThumbsDown,ThumbsUp} from "lucide-react";
import {useNoura} from "./provider";
import {CUISINE_RU,MEAL_LABEL,RECIPES,tasteMatch,type Recipe} from "@/lib/noura";

const categories=["Все","До 10 минут","До €5","40+ г белка","Для аэрогриля","После тренировки","Перед тренировкой","Meal prep","Полезные десерты","Высокая сытость","Минимум посуды","Из продуктов дома"];
const initial={query:"",maxCalories:"",minProtein:"",maxCost:"",maxTime:"",difficulty:"",cuisine:"",meal:"",goal:"",ingredient:"",equipment:"",minRating:"",minMatch:""};
type Filters=typeof initial;
export function CatalogView({personal}:{personal:boolean}){
 const {state,setRecipe,setCook,setFeedback,react,toggleFavorite}=useNoura();const [filters,setFilters]=useState<Filters>(initial);const [category,setCategory]=useState("Все");const [showFilters,setShowFilters]=useState(false);const [sort,setSort]=useState(personal?"taste":"taste");
 const set=(key:keyof Filters,value:string)=>setFilters(f=>({...f,[key]:value}));
 const list=useMemo(()=>RECIPES.filter(r=>{
  const match=tasteMatch(r,state),hay=`${r.title} ${r.sourceTitle} ${r.cuisine} ${r.ingredients.map(i=>`${i.name} ${i.nameRu}`).join(" ")}`.toLowerCase();
  if(state.profile.allergies.some(a=>r.allergens.includes(a)))return false;
  if(state.profile.disliked.some(x=>hay.includes(x.toLowerCase())))return false;
  if(Object.entries(state.tastes).some(([word,value])=>value===-2&&hay.includes(word)))return false;
  if(personal&&match===0)return false;
  if(filters.query&&!hay.includes(filters.query.toLowerCase()))return false;
  if(filters.maxCalories&&r.calories>Number(filters.maxCalories))return false;
  if(filters.minProtein&&r.protein<Number(filters.minProtein))return false;
  if(filters.maxCost&&r.cost>Number(filters.maxCost))return false;
  if(filters.maxTime&&r.time>Number(filters.maxTime))return false;
  if(filters.difficulty&&r.difficulty!==filters.difficulty)return false;
  if(filters.cuisine&&r.cuisine!==filters.cuisine)return false;
  if(filters.meal&&r.meal!==filters.meal)return false;
  if(filters.ingredient&&!hay.includes(filters.ingredient.toLowerCase()))return false;
  if(filters.equipment&&!r.equipment.includes(filters.equipment))return false;
  if(filters.minRating&&(state.ratings[r.id]??0)<Number(filters.minRating))return false;
  if(filters.minMatch&&match<Number(filters.minMatch))return false;
  if(filters.goal==="cutting"&&r.protein<35)return false;
  if(filters.goal==="fat_loss"&&r.calories>550)return false;
  if(filters.goal==="clean_bulk"&&r.protein<30)return false;
  if(category==="До 10 минут"&&r.time>10)return false;
  if(category==="До €5"&&r.cost>5)return false;
  if(category==="40+ г белка"&&r.protein<40)return false;
  if(category==="Для аэрогриля"&&!r.equipment.includes("Духовка"))return false;
  if(category==="После тренировки"&&r.protein<35)return false;
  if(category==="Перед тренировкой"&&r.carbs<55)return false;
  if(category==="Meal prep"&&r.time>35)return false;
  if(category==="Полезные десерты"&&r.meal!=="snack")return false;
  if(category==="Высокая сытость"&&r.fiber<6&&r.protein<35)return false;
  if(category==="Минимум посуды"&&r.equipment.length>1)return false;
  if(category==="Из продуктов дома"&&!state.profile.pantry.some(x=>hay.includes(x.toLowerCase())))return false;
  return true;
 }).sort((a,b)=>sort==="time"?a.time-b.time:sort==="cost"?a.cost-b.cost:sort==="protein"?b.protein-a.protein:tasteMatch(b,state)-tasteMatch(a,state)),[state,filters,category,personal,sort]);
 return <><div className="page-heading"><div><p className="eyebrow">{personal?"ПОДСТРОЕНО ПОД ТВОИ ВКУСЫ":"ИДЕИ ДЛЯ КАЖДОГО ДНЯ"}</p><h1>{personal?"Для тебя":"Каталог рецептов"}<span className="lime">.</span></h1><p className="muted">{personal?"Сначала блюда, которые больше всего подходят твоим вкусам.":`${RECIPES.length} разных блюд с ингредиентами и пошаговой готовкой.`}</p></div><div className="count-badge"><Sparkles size={16}/>{list.length} блюд</div></div>
 <div className="catalog-toolbar"><label className="searchbox"><Search size={19}/><input value={filters.query} onChange={e=>set("query",e.target.value)} placeholder="Блюдо, продукт или кухня" aria-label="Поиск рецептов"/></label><button className={`button secondary ${showFilters?"selected":""}`} onClick={()=>setShowFilters(v=>!v)} aria-expanded={showFilters}><SlidersHorizontal size={17}/>Фильтры</button><select className="field sort-control" value={sort} onChange={e=>setSort(e.target.value)} aria-label="Сортировка"><option value="taste">Taste Match</option><option value="time">Быстрее</option><option value="cost">Дешевле</option><option value="protein">Больше белка</option></select></div>
 {showFilters&&<div className="filter-panel"><label>Калории до<input type="number" min="100" value={filters.maxCalories} onChange={e=>set("maxCalories",e.target.value)} placeholder="ккал"/></label><label>Белок от<input type="number" min="0" value={filters.minProtein} onChange={e=>set("minProtein",e.target.value)} placeholder="г"/></label><label>Стоимость до<input type="number" min="0" value={filters.maxCost} onChange={e=>set("maxCost",e.target.value)} placeholder="€"/></label><label>Время до<input type="number" min="0" value={filters.maxTime} onChange={e=>set("maxTime",e.target.value)} placeholder="мин"/></label><label>Сложность<select value={filters.difficulty} onChange={e=>set("difficulty",e.target.value)}><option value="">Любая</option>{["Легко","Средне","Не спеша"].map(x=><option key={x}>{x}</option>)}</select></label><label>Кухня<select value={filters.cuisine} onChange={e=>set("cuisine",e.target.value)}><option value="">Любая</option>{[...new Set(RECIPES.map(x=>x.cuisine))].sort().map(x=><option key={x} value={x}>{CUISINE_RU[x]??x}</option>)}</select></label><label>Приём пищи<select value={filters.meal} onChange={e=>set("meal",e.target.value)}><option value="">Любой</option>{Object.entries(MEAL_LABEL).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label><label>Цель<select value={filters.goal} onChange={e=>set("goal",e.target.value)}><option value="">Любая</option><option value="clean_bulk">Набор массы</option><option value="fat_loss">Снижение веса</option><option value="cutting">Сушка</option></select></label><label>Ингредиент<input value={filters.ingredient} onChange={e=>set("ingredient",e.target.value)} placeholder="Например, рис"/></label><label>Техника<select value={filters.equipment} onChange={e=>set("equipment",e.target.value)}><option value="">Любая</option>{["Плита","Духовка"].map(x=><option key={x}>{x}</option>)}</select></label><label>Оценка от<select value={filters.minRating} onChange={e=>set("minRating",e.target.value)}><option value="">Любая</option>{[3,4,5].map(x=><option key={x} value={x}>{x} ★</option>)}</select></label><label>Taste Match от<input type="number" min="0" max="99" value={filters.minMatch} onChange={e=>set("minMatch",e.target.value)} placeholder="%"/></label><button className="button ghost" onClick={()=>{setFilters(initial);setCategory("Все")}}>Сбросить фильтры</button></div>}
 <div className="category-strip">{categories.map(x=><button key={x} className={`category-chip ${category===x?"active":""}`} onClick={()=>setCategory(x)}>{x}</button>)}</div>
 {list.length?<div className="catalog-grid">{list.map(r=><RecipeTile key={r.id} recipe={r} onOpen={()=>setRecipe(r)} onCook={()=>setCook(r)} liked={(state.reactions[r.id]??0)>0} favorite={state.favorites.includes(r.id)} match={tasteMatch(r,state)} onLike={()=>react(r,1)} onDislike={()=>setFeedback(r)} onFavorite={()=>toggleFavorite(r.id)} rating={state.ratings[r.id]??0}/>)}</div>:<div className="empty-state"><Search size={30}/><h2>Подходящих блюд пока нет</h2><p>Попробуй убрать один из фильтров или изменить ограничения в профиле.</p><button className="button primary" onClick={()=>{setFilters(initial);setCategory("Все")}}>Очистить фильтры</button></div>}</>;
}
function RecipeTile({recipe:r,onOpen,onCook,liked,favorite,match,onLike,onDislike,onFavorite,rating}:{recipe:Recipe;onOpen:()=>void;onCook:()=>void;liked:boolean;favorite:boolean;match:number;onLike:()=>void;onDislike:()=>void;onFavorite:()=>void;rating:number}){return <article className="catalog-card"><button className="photo-button" onClick={onOpen} aria-label={`Открыть ${r.title}`}><img src={r.image} alt={r.title} loading="lazy"/></button><div className="catalog-card-content"><div className="catalog-topline"><span className="match"><Sparkles size={13}/>{match}% Taste Match</span><span className="muted">{rating?`${rating} ★`:CUISINE_RU[r.cuisine]??r.cuisine}</span></div><button className="meal-title" onClick={onOpen}><h3>{r.title}</h3></button><p className="catalog-facts">{r.calories} ккал <span>·</span> {r.protein} г белка <span>·</span> €{r.cost.toFixed(2)}</p><p className="muted card-time"><Clock3 size={14}/> {r.time} мин <span>·</span> {r.difficulty}</p><div className="catalog-actions"><button className="button primary" onClick={onCook}><ChefHat size={16}/>Готовить</button><button className={`icon-button ${liked?"selected":""}`} aria-label={`Нравится: ${r.title}`} title="Нравится" onClick={onLike}><ThumbsUp size={16}/></button><button className="icon-button" aria-label={`Не нравится: ${r.title}`} title="Не нравится" onClick={onDislike}><ThumbsDown size={16}/></button><button className={`icon-button ${favorite?"selected":""}`} aria-label={`${favorite?"Убрать":"Добавить"} в избранное: ${r.title}`} title="Избранное" onClick={onFavorite}><Heart size={16} fill={favorite?"currentColor":"none"}/></button></div></div></article>}
