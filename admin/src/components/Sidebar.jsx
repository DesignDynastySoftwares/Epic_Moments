import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaPlusCircle,
  FaList,
  FaShoppingCart,
  FaThLarge,
  FaThList,
  FaFolderOpen,
  FaEnvelope,
  FaKey,
  FaBox,
  FaStar,
  FaTags,
  FaListAlt,
  FaStore,
  FaUsersCog,
} from 'react-icons/fa';
import './Sidebar.css';

const groups = [
  {
    title: 'Products',
    links: [
      { to: '/add', icon: FaPlusCircle, label: 'Add Items' },
      { to: '/list', icon: FaList, label: 'List Items' },
      { to: '/PopularProducts', icon: FaBox, label: 'Add Best Seller' },
      { to: '/PopularProductsList', icon: FaStar, label: 'Best Sellers List' },
      { to: '/OfferProducts', icon: FaTags, label: 'Add Combo Offer' },
      { to: '/OfferProductsList', icon: FaListAlt, label: 'Combo Offers List' },
    ],
  },
  {
    title: 'Decoratives',
    links: [
      { to: '/DeskDecoratives', icon: FaPlusCircle, label: 'Desk Decoratives' },
      { to: '/DeskDecorativesList', icon: FaList, label: 'Desk Decoratives List' },
      { to: '/WallDecoratives', icon: FaBox, label: 'Wall Decoratives' },
      { to: '/WallDecorativesList', icon: FaThList, label: 'Wall Decoratives List' },
      { to: '/CarDecoratives', icon: FaBox, label: 'Car Decoratives' },
      { to: '/CarDecorativesList', icon: FaThList, label: 'Car Decoratives List' },
      { to: '/BusinessNeeds', icon: FaFolderOpen, label: 'Business Needs' },
      { to: '/BusinessNeedsList', icon: FaFolderOpen, label: 'Business Needs List' },
    ],
  },
  {
    title: 'Categories',
    links: [
      { to: '/catagereAdd', icon: FaThLarge, label: 'Catagere Image' },
      { to: '/catagereList', icon: FaThList, label: 'Catagere List' },
      { to: '/ShopCategoryAdd', icon: FaStore, label: 'Add Shop Category' },
      { to: '/ShopCategoryList', icon: FaThLarge, label: 'Shop Categories List' },
      { to: '/manageCategory', icon: FaFolderOpen, label: 'Manage Category' },
    ],
  },
  {
    title: 'Content',
    links: [
      { to: '/OfferBanner', icon: FaTags, label: 'Offer Banner' },
    ],
  },
  {
    title: 'Reviews & Enquiries',
    links: [
      { to: '/GoogleReviewAdd', icon: FaStar, label: 'Google Review' },
      { to: '/GoogleReviewList', icon: FaListAlt, label: 'Google Review List' },
      { to: '/enquiries', icon: FaEnvelope, label: 'Enquiries' },
    ],
  },
  {
    title: 'Orders & Admin',
    links: [
      { to: '/orders', icon: FaShoppingCart, label: 'Orders' },
      { to: '/admin/keywords', icon: FaKey, label: 'Keyword Manager' },
      { to: '/admin/users', icon: FaUsersCog, label: 'Admin Users' },
    ],
  },
];

const Sidebar = ({ open = false }) => {
  return (
    <aside className={`adm-sidebar${open ? ' adm-sidebar--open' : ''}`}>
      {groups.map((group) => (
        <div className="adm-group" key={group.title}>
          <p className="adm-group__title">{group.title}</p>
          {group.links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? 'adm-link active' : 'adm-link'
              }
            >
              <Icon />
              <span className="adm-link__text">{label}</span>
            </NavLink>
          ))}
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
