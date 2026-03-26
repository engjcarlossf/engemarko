import { useCallback, useState } from "react";
import { Link, useLocation } from "react-router";
import { CalenderIcon, ChevronDownIcon, GridIcon, HorizontaLDots } from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  allowedProfiles: string[];
  subItems?: { name: string; path: string; allowedProfiles: string[] }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
    allowedProfiles: ["PO", "SM", "DEV"],
  },
  {
    icon: <GridIcon />,
    name: "Produção API",
    allowedProfiles: ["PO", "SM"],
    subItems: [
      { name: "Kanban", path: "/kanban", allowedProfiles: ["PO", "SM"] },
      { name: "Macro (Pipeline)", path: "/pipeline", allowedProfiles: ["PO", "SM"] },
    ],
  },
  {
    icon: <CalenderIcon />,
    name: "Calendário",
    path: "/calendar",
    allowedProfiles: ["PO", "SM", "DEV"],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);

  const sessao = localStorage.getItem("@Engemarko:Sessao");
  const userPerfil = sessao ? JSON.parse(sessao).perfil : "DEV";

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  // Filtra itens do menu pelo perfil do usuário
  const filteredNavItems = navItems.filter(item => item.allowedProfiles.includes(userPerfil));

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 h-screen transition-all duration-300 z-50 border-r border-gray-200 ${
        isExpanded || isHovered || isMobileOpen ? "w-[290px]" : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* LOGO CENTRALIZADA */}
      <div className="py-8 flex items-center justify-center w-full">
        <Link to="/dashboard" className="flex items-center justify-center">
          {isExpanded || isHovered || isMobileOpen ? (
            <img src="/images/logo/logo2.png" alt="Engemarko" width={150} height={40} />
          ) : (
            <img src="/images/logo/logo3.png" alt="E" width={32} height={32} />
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto no-scrollbar flex-grow">
        <nav>
          <h2 className={`mb-4 text-xs uppercase flex text-gray-400 ${!isExpanded && !isHovered ? "justify-center" : "justify-start"}`}>
            {isExpanded || isHovered || isMobileOpen ? "Menu Operacional" : <HorizontaLDots className="size-6" />}
          </h2>
          <ul className="flex flex-col gap-4">
            {filteredNavItems.map((nav, index) => (
              <li key={nav.name}>
                {nav.subItems ? (
                  <>
                    <button
                      onClick={() => setOpenSubmenu(openSubmenu === index ? null : index)}
                      className={`menu-item w-full ${openSubmenu === index ? "menu-item-active" : "menu-item-inactive"} ${!isExpanded && !isHovered ? "justify-center" : "justify-start"}`}
                    >
                      <span className="menu-item-icon-size">{nav.icon}</span>
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <>
                          <span className="menu-item-text">{nav.name}</span>
                          <ChevronDownIcon className={`ml-auto w-5 h-5 transition-transform ${openSubmenu === index ? "rotate-180" : ""}`} />
                        </>
                      )}
                    </button>
                    {openSubmenu === index && (isExpanded || isHovered || isMobileOpen) && (
                      <ul className="mt-2 space-y-1 ml-9">
                        {nav.subItems.map(sub => (
                          <li key={sub.name}>
                            <Link to={sub.path} className={`menu-dropdown-item ${isActive(sub.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}>
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link to={nav.path!} className={`menu-item ${isActive(nav.path!) ? "menu-item-active" : "menu-item-inactive"} ${!isExpanded && !isHovered ? "justify-center" : "justify-start"}`}>
                    <span className="menu-item-icon-size">{nav.icon}</span>
                    {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;