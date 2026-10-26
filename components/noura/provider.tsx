"use client";
import {createContext,useContext,useEffect,useState,type ReactNode} from "react";
import {toast} from "sonner";
import {AppState,BY_ID,buildDay,createInitialState,localDateKey,RECIPES,replaceChoice,SWAP_MODES,todayKey,weekDates,type Goal,type PlanItem,type Profile,type Recipe,type SwapMode} from "@/lib/noura";

type View="today"|"plan"|"recipes"|"for-you"|"shopping"|"progress"|"profile";
type Context={state:AppState;view:View;setView:(v:View)=>void;date:string;setDate:(s:string)=>void;recipe:Recipe|null;setRecipe:(r:Recipe|null)=>void;cook:Recipe|null;setCook:(r:Recipe|null)=>void;swapItem:PlanItem|null;setSwapItem:(r:PlanItem|null)=>void;feedback:Recipe|null;setFeedback:(r:Recipe|null)=>void;update:(fn:(draft:AppState)=>void)=>void;regenerateDay:(date:string)=>void;regenerateWeek:()=>void;chooseSwap:(mode:SwapMode,ingredient?:string)=>void;react:(r:Recipe,value:1|-1,reason?:string)=>void;toggleFavorite:(id:string)=>void;markEaten:(key:string,date:string)=>void;updateProfile:(fn:(p:Profile)=>void)=>void;restartOnboarding:()=>void;onboarding:boolean;setOnboarding:(v:boolean)=>void};
const C=createContext<Context|null>(null);
const STORAGE="noura-state-v1";
export function useNoura(){const value=useContext(C);if(!value)throw new Error("Noura provider missing");return value;}
function restore(value:string):AppState|null{try{const data=JSON.parse(value);if(!data||typeof data!=="object"||!data.profile||!data.plans||!Array.isArray(data.favorites))return null;return {...createInitialState(),...data,profile:{...createInitialState().profile,...data.profile}};}catch{return null;}}
export function NouraProvider({children}:{children:ReactNode}){
  const [state,setState]=useState<AppState>(createInitialState);
  const [hydrated,setHydrated]=useState(false);
  const [view,setView]=useState<View>("today");
  const [date,setDate]=useState(todayKey);
  const [recipe,setRecipe]=useState<Recipe|null>(null);
  const [cook,setCook]=useState<Recipe|null>(null);
  const [swapItem,setSwapItem]=useState<PlanItem|null>(null);
  const [feedback,setFeedback]=useState<Recipe|null>(null);
  const [onboarding,setOnboarding]=useState(false);
  useEffect(()=>{const saved=localStorage.getItem(STORAGE);if(saved){const loaded=restore(saved);if(loaded)setState(loaded);}setHydrated(true);},[]);
  useEffect(()=>{if(hydrated)localStorage.setItem(STORAGE,JSON.stringify(state));},[hydrated,state]);
  const update=(fn:(draft:AppState)=>void)=>setState(current=>{const next=structuredClone(current);fn(next);return next;});
  const regenerateDay=(day:string)=>{update(s=>{const old=s.plans[day]??[];const locked=old.filter(item=>item.locked);const used=weekDates().flatMap(d=>(s.plans[d]??[]).map(item=>item.recipeId));const fresh=buildDay(s.profile,s.tastes,s.reactions,used,day);s.plans[day]=fresh.map((item,index)=>locked.find(l=>l.key===old[index]?.key)??{...item,key:`${day}-${index}`});});toast.success("План на день обновлён");};
  const regenerateWeek=()=>{update(s=>{let used:string[]=[];for(const day of weekDates()){const current=s.plans[day]??[];const fresh=buildDay(s.profile,s.tastes,s.reactions,used,day);s.plans[day]=fresh.map((item,index)=>current[index]?.locked?current[index]:{...item,key:`${day}-${index}`});used.push(...s.plans[day].map(x=>x.recipeId));}});toast.success("Недельный план обновлён");};
  const chooseSwap=(mode:SwapMode,ingredient="")=>{if(!swapItem)return;const found=replaceChoice(swapItem,mode,state,date,ingredient);if(!found){toast.error("Подходящей замены нет. Попробуй другой критерий.");return;}update(s=>{const day=s.plans[date]??[];const i=day.findIndex(x=>x.key===swapItem.key);if(i>=0)day[i]={...day[i],recipeId:found.id,eaten:false};});setSwapItem(null);toast.success(`В меню: ${found.title}`);};
  const react=(r:Recipe,value:1|-1,reason?:string)=>{update(s=>{s.reactions[r.id]=Math.max(-3,Math.min(3,(s.reactions[r.id]??0)+value));if(reason)s.reasons[r.id]=reason;});if(value>0)toast.success("Учтём это в следующих рекомендациях");else toast("Спасибо, учтём причину при выборе блюд");};
  const toggleFavorite=(id:string)=>update(s=>{s.favorites=s.favorites.includes(id)?s.favorites.filter(x=>x!==id):[...s.favorites,id];});
  const markEaten=(key:string,day:string)=>{update(s=>{const item=s.plans[day]?.find(x=>x.key===key);if(item)item.eaten=!item.eaten;});};
  const updateProfile=(fn:(p:Profile)=>void)=>update(s=>{fn(s.profile);});
  const restartOnboarding=()=>{setView("today");setOnboarding(true);};
  useEffect(()=>{if(hydrated&&!state.plans[todayKey()]){update(s=>{s.plans[todayKey()]=buildDay(s.profile,s.tastes,s.reactions,[],todayKey());});}},[hydrated,state.plans]);
  return <C.Provider value={{state,view,setView,date,setDate,recipe,setRecipe,cook,setCook,swapItem,setSwapItem,feedback,setFeedback,update,regenerateDay,regenerateWeek,chooseSwap,react,toggleFavorite,markEaten,updateProfile,restartOnboarding,onboarding,setOnboarding}}>{children}</C.Provider>;
}
export type {View};
