import { lazyLoad } from '@/lib/lazy-loading';

// Componentes principais
export const Header = lazyLoad(() => import('./Header'));
export const Modal = lazyLoad(() => import('./Modal'));
export const ModalFigurinhas = lazyLoad(() => import('./ModalFigurinhas'));
export const ModalProporTroca = lazyLoad(() => import('./ModalProporTroca'));
export const ModalAvisoMVP = lazyLoad(() => import('./ModalAvisoMVP'));
export const FigurinhaCard = lazyLoad(() => import('./FigurinhaCard'));
export const Figurinha = lazyLoad(() => import('./Figurinha'));
export const PacoteAnimation = lazyLoad(() => import('./PacoteAnimation'));
export const EscudosCarousel = lazyLoad(() => import('./EscudosCarousel'));
export const FiltrosAlbum = lazyLoad(() => import('./FiltrosAlbum'));
export const FiltrosPacotes = lazyLoad(() => import('./FiltrosPacotes'));
export const FiltrosRepetidas = lazyLoad(() => import('./FiltrosRepetidas'));
export const UserStats = lazyLoad(() => import('./UserStats'));
export const EditarAvatar = lazyLoad(() => import('./EditarAvatar'));
export const Logo = lazyLoad(() => import('./Logo'));
export const AdSense = lazyLoad(() => import('./AdSense'));
export const ProtectedNav = lazyLoad(() => import('./ProtectedNav'));
export const Notificacoes = lazyLoad(() => import('./Notificacoes')); 