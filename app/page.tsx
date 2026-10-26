"use client";
import type {CSSProperties} from "react";
import {CalendarDays,ChefHat,ChartNoAxesColumn,Heart,House,Leaf,Search,ShoppingBasket,Sparkles,UserRound,UtensilsCrossed,Zap} from "lucide-react";
import {Sidebar,SidebarContent,SidebarFooter,SidebarHeader,SidebarProvider} from "@/components/ui/sidebar";
import {Toaster} from "@/components/ui/sonner";
import {NouraProvider,useNoura,type View} from "@/components/noura/provider";
import {TodayView} from "@/components/noura/today";
import {CatalogView} from "@/components/noura/catalog";
import {PlannerView} from "@/components/noura/planner";
import {ShoppingView} from "@/components/noura/shopping";
import {ProgressView,ProfileView} from "@/components/noura/profile";
import {RecipeDialogs} from "@/components/noura/recipe-dialogs";
import {Onboarding} from "@/components/noura/onboarding";
import {GOALS} from "@/lib/noura";

const nav:{view:View;label:string;icon:typeof House}[]=[{view:"today",label:"Сегодня",icon:House},{view:"plan",label:"План питания",icon:CalendarDays},{view:"recipes",label:"Рецепты",icon:UtensilsCrossed},{view:"for-you",label:"Для тебя",icon:Sparkles},{view:"shopping",label:"Покупки",icon:ShoppingBasket},{view:"progress",label:"Прогресс",icon:ChartNoAxesColumn},{view:"profile",label:"Профиль",icon:UserRound}];
const mobile=nav.filter(item=>["today","plan","recipes","progress","profile"].includes(item.view));
function App(){
 const {view,setView,state,onboarding}=useNoura();
 const title=nav.find(n=>n.view===view)?.label;
 const go=(page:View)=>{setView(page);window.scrollTo({top:0,behavior:"smooth"});};
 return <SidebarProvider style={{"--sidebar-width":"224px"} as CSSProperties}>
  <Sidebar className="noura-sidebar"><SidebarHeader><button className="brand" onClick={()=>go("today")} aria-label="NOURA, открыть сегодня"><span className="brand-mark"><Leaf/></span>NOURA<span className="brand-dot">.</span></button></SidebarHeader><SidebarContent><div className="nav-caption">ТВОЁ ПИТАНИЕ</div><nav aria-label="Основное меню">{nav.slice(0,6).map(({view:page,label,icon:Icon})=><button key={page} className={`nav-item ${view===page?"active":""}`} onClick={()=>go(page)}><Icon/>{label}</button>)}</nav></SidebarContent><SidebarFooter><div className="sidebar-goal"><Zap size={19}/><span>{GOALS.find(g=>g.id===state.profile.goal)?.label}<small>Твоя цель на каждый день</small></span></div><button className="profile-link" onClick={()=>go("profile")}><span className="avatar">{state.profile.name.slice(0,1)}</span><span>{state.profile.name}<small>Мой профиль</small></span><UserRound size={17}/></button></SidebarFooter></Sidebar>
  <main className="workspace"><header className="topbar"><span>Моё пространство <span className="slash">/</span> {title}</span><span className="topbar-note"><Sparkles size={16}/> Подстроено под тебя</span></header><div className="page-content">{view==="today"?<TodayView/>:view==="plan"?<PlannerView/>:view==="shopping"?<ShoppingView/>:view==="progress"?<ProgressView/>:view==="profile"?<ProfileView/>:<CatalogView personal={view==="for-you"}/>}</div></main>
  <nav className="mobile-nav" aria-label="Меню телефона">{mobile.map(({view:page,label,icon:Icon})=><button key={page} onClick={()=>go(page)} className={view===page?"active":""} aria-current={view===page?"page":undefined}><Icon/>{page==="plan"?"План":label}</button>)}</nav>
  <RecipeDialogs/>{onboarding&&<Onboarding/>}<Toaster position="bottom-center" richColors closeButton/>
 </SidebarProvider>;
}
export default function Home(){return <NouraProvider><App/></NouraProvider>}
