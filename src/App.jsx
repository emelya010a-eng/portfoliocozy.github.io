import React, { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshTransmissionMaterial, OrbitControls, Sparkles } from '@react-three/drei';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, ArrowRight, Asterisk, Menu, X, MoveUpRight } from 'lucide-react';
import * as THREE from 'three';

function Sculpture() {
  const mesh = useRef();
  const wire = useRef();
  const shape = useMemo(() => {
    const g = new THREE.SphereGeometry(1.28, 96, 64);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(p, i);
      const wave = Math.sin(v.x * 2.2 + v.y * 1.4) * Math.cos(v.z * 2.5 - v.y) * 0.035;
      v.multiplyScalar(1 + wave);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.12;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.24) * 0.08;
    }
    if (wire.current) {
      wire.current.rotation.y -= delta * 0.055;
      wire.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.18) * 0.12;
    }
  });
  return <group>
    <Float speed={0.65} rotationIntensity={0.08} floatIntensity={0.12}>
      <mesh ref={mesh} geometry={shape}>
        <MeshTransmissionMaterial backside backsideThickness={0.2} thickness={0.85} roughness={0.17} transmission={0.92} ior={1.28} chromaticAberration={0.045} anisotropy={0.15} color="#e4e1d8" resolution={256} />
      </mesh>
      <mesh ref={wire} geometry={new THREE.TorusGeometry(1.48, 0.009, 8, 180)} rotation={[0.72, 0.25, -0.48]}>
        <meshStandardMaterial color="#ff6b3d" metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh geometry={new THREE.TorusGeometry(1.58, 0.005, 6, 160)} rotation={[1.12, -0.45, 0.7]}>
        <meshStandardMaterial color="#a9aaa3" metalness={0.7} roughness={0.32} />
      </mesh>
    </Float>
    <Sparkles count={22} scale={4.3} size={1.1} speed={0.1} color="#ff8a62" opacity={0.22} />
    <Environment preset="studio" />
    <ambientLight intensity={0.65} />
    <directionalLight position={[3, 4, 4]} intensity={2.2} color="#fff0e8" />
    <pointLight position={[-3, -1, 2]} intensity={22} color="#ff744c" distance={7} />
  </group>;
}

function MiniObject({ type = 'orb' }) {
  const ref = useRef();
  useFrame((state, delta) => { if (ref.current) { ref.current.rotation.x += delta * 0.08; ref.current.rotation.y += delta * 0.12; } });
  return <group ref={ref}>
    {type === 'orb' ? <mesh><sphereGeometry args={[0.82, 64, 48]} /><meshPhysicalMaterial color="#dedbd3" metalness={0.52} roughness={0.2} clearcoat={0.85} clearcoatRoughness={0.14} /></mesh> : <mesh><torusKnotGeometry args={[0.48, 0.13, 180, 24, 2, 5]} /><meshPhysicalMaterial color="#b94324" metalness={0.58} roughness={0.22} clearcoat={0.8} clearcoatRoughness={0.16} /></mesh>}
    <pointLight position={[1, 1, 2]} intensity={8} color="#ff744c" />
  </group>;
}

function Scene({ small = false, type = 'orb' }) {
  return <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, small ? 4.2 : 5.8], fov: small ? 34 : 38 }} gl={{ antialias: true, alpha: true }}>
    <Suspense fallback={null}>
      {small ? <><MiniObject type={type} /><Environment preset="studio" /></> : <Sculpture />}
      <OrbitControls enablePan={false} enableZoom={false} rotateSpeed={0.55} autoRotate={false} />
    </Suspense>
  </Canvas>;
}

const Reveal = ({ children, className = '', delay = 0 }) => {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
};

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeScene, setActiveScene] = useState('form');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const smoothY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const nav = [['Обо мне', '#about'], ['Эксперименты', '#lab'], ['Подход', '#approach'], ['Контакт', '#contact']];
  const closeMenu = () => setMenuOpen(false);

  return <div className="site-shell">
    <motion.div className="scroll-progress" style={{ scaleX }} />
    <header className="site-header">
      <a href="#top" className="wordmark" aria-label="Cozy — наверх"><span>cozy<span className="wordmark-slash">/</span>dev</span></a>
      <nav className="desktop-nav" aria-label="Главная навигация">{nav.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
      <a className="header-cta" href="https://t.me/cozymef" target="_blank" rel="noreferrer">Написать <ArrowUpRight size={15} /></a>
      <button className="menu-toggle" aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
    </header>
    {menuOpen && <motion.nav className="mobile-nav" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} aria-label="Мобильная навигация">{nav.map(([label, href]) => <a key={href} href={href} onClick={closeMenu}>{label}<ArrowUpRight size={16} /></a>)}<a href="https://t.me/cozymef" onClick={closeMenu}>Написать в Telegram <ArrowUpRight size={16} /></a></motion.nav>}

    <main id="top">
      <section className="hero scene-dark">
        <div className="hero-meta"><span>COZY — ВЕБ-РАЗРАБОТКА И ЭКСПЕРИМЕНТЫ</span><span>ИЛЬЯ / 17</span></div>
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">ИДЕИ → ДИЗАЙН → КОД</p>
            <h1>Делаю<br /><em>цифровое</em><br />осязаемым<span className="orange-period">.</span></h1>
            <p className="hero-description">Я Илья, в сети — Cozy. Изучаю веб-разработку и исследую, как соединить код, форму и ощущение в одном сайте.</p>
            <div className="hero-actions"><a className="button button-orange" href="#lab">Смотреть эксперименты <ArrowDownRight size={17} /></a><a className="text-link light-link" href="https://t.me/cozymef" target="_blank" rel="noreferrer">Обсудить идею <ArrowUpRight size={16} /></a></div>
            <div className="hero-footnote"><span>ЛИСТАЙ В СВОЁМ ТЕМПЕ <ArrowDownRight size={13} /></span></div>
          </div>
          <div className="hero-art" aria-label="Интерактивная абстрактная 3D-скульптура">
            <div className="art-index art-index-top">ИНТЕРАКТИВНАЯ ФОРМА</div>
            <div className="art-grid-lines" />
            <div className="hero-canvas"><Scene /></div>
            <div className="art-caption"><span>ФОРМА / СВЕТ / ДВИЖЕНИЕ</span></div>
            <div className="art-cross">✳</div>
          </div>
        </div>
        <div className="hero-bottom"><span>СОБИРАЮ ИДЕИ В ИНТЕРФЕЙСЫ.</span><span>ЧЕСТНО УЧУСЬ И ПРОБУЮ НОВОЕ.</span><ArrowDownRight size={18} /></div>
      </section>

      <section id="about" className="intro-section section-pad">
        <div className="section-label"><span>ОБО МНЕ</span><span>КОРОТКО И ЧЕСТНО</span></div>
        <div className="intro-layout">
          <Reveal><h2>Любопытство<br />— мой <span className="serif-accent">движок.</span></h2></Reveal>
          <Reveal delay={0.12} className="intro-body"><p className="lead">Мне 17. Я начинающий разработчик, которому интересно не просто заставить сайт работать — а найти для него правильную форму.</p><p>Изучаю инструменты, разбираю чужие решения, экспериментирую с интерфейсами и постепенно превращаю практику в навык. Здесь показываю процесс без выдуманных кейсов и громких обещаний.</p><a href="#approach" className="text-link">Как я подхожу к работе <ArrowUpRight size={15} /></a></Reveal>
        </div>
        <div className="principles-strip"><span>СЕЙЧАС ИЗУЧАЮ</span><div>Интерфейсы</div><div>React</div><div>3D в браузере</div><div>Анимация</div></div>
      </section>

      <section id="lab" className="lab-section section-pad">
        <div className="section-label"><span>ЭКСПЕРИМЕНТЫ</span><span>УЧЕБНЫЕ РАБОТЫ</span></div>
        <div className="lab-heading"><Reveal><h2>Проверяю<br /><span className="serif-accent">идеи на ощупь.</span></h2></Reveal><p>Пока без коммерческих проектов. Вместо выдуманного портфолио — пространство для небольших концептов, которые можно развивать в реальные работы.</p></div>
        <div className="experiment-grid">
          <article className={'experiment-card experiment-main ' + (activeScene === 'form' ? 'is-selected' : '')}>
            <button className="experiment-visual visual-cream" onClick={() => setActiveScene('form')} aria-label="Выбрать эксперимент Форма и свет"><div className="visual-topline"><span>ЭКСПЕРИМЕНТ</span><span>ФОРМА / СВЕТ</span></div><div className="mini-canvas"><Scene small type="orb" /></div><span className="visual-plus">↗</span></button>
            <div className="experiment-info"><div><span className="card-kicker">3D / MATERIAL</span><h3>Форма и свет</h3></div><span className="status-pill"><i /> В ПРОЦЕССЕ</span></div>
            <p className="experiment-desc">Исследование материала, отражений и движения в браузерной сцене.</p>
          </article>
          <article className={'experiment-card ' + (activeScene === 'motion' ? 'is-selected' : '')}>
            <button className="experiment-visual visual-orange" onClick={() => setActiveScene('motion')} aria-label="Выбрать эксперимент Движение"><div className="visual-topline"><span>ЭКСПЕРИМЕНТ</span><span>ДВИЖЕНИЕ</span></div><div className="mini-canvas"><Scene small type="knot" /></div><span className="visual-plus">↗</span></button>
            <div className="experiment-info"><div><span className="card-kicker">INTERACTION / MOTION</span><h3>Движение</h3></div><span className="status-pill"><i /> В ПРОЦЕССЕ</span></div>
            <p className="experiment-desc">Как небольшая реакция на действия пользователя меняет ощущение интерфейса.</p>
          </article>
        </div>
        <div className="lab-note"><Asterisk size={17} /><p>Это авторские учебные эксперименты, а не завершённые клиентские проекты. Сцены здесь — часть самого портфолио.</p></div>
      </section>

      <section id="approach" className="approach-section scene-dark section-pad">
        <div className="section-label"><span>МОЙ ПОДХОД</span><span>МЕНЬШЕ ШУМА. БОЛЬШЕ СМЫСЛА.</span></div>
        <div className="approach-head"><Reveal><h2>Сначала смысл.<br /><em>Потом эффекты.</em></h2></Reveal><p>Хороший интерфейс не обязан кричать. Он должен быть понятным, точным и запоминаться благодаря деталям.</p></div>
        <div className="approach-list">
          <div className="approach-row"><h3>Слушаю задачу</h3><p>Разбираюсь, для кого сайт и какую мысль он должен донести.</p><ArrowUpRight size={17} /></div>
          <div className="approach-row"><h3>Собираю систему</h3><p>Продумываю сетку, контраст, типографику и поведение на разных экранах.</p><ArrowUpRight size={17} /></div>
          <div className="approach-row"><h3>Добавляю характер</h3><p>Использую движение и 3D там, где они помогают идее, а не отвлекают.</p><ArrowUpRight size={17} /></div>
        </div>
      </section>

      <section id="contact" className="contact-section section-pad">
        <div className="section-label"><span>КОНТАКТ</span><span>ЕСТЬ ИДЕЯ? ПОГОВОРИМ.</span></div>
        <div className="contact-layout"><Reveal><h2>Давай сделаем<br /><span className="serif-accent">что-то живое.</span></h2></Reveal><div className="contact-copy"><p>Открыт к интересным задачам, совместным экспериментам и новым знакомствам. Напиши, расскажи идею — обсудим без лишнего официоза.</p><a className="contact-button" href="https://t.me/cozymef" target="_blank" rel="noreferrer"><span>Написать Cozy в Telegram</span><MoveUpRight size={20} /></a><span className="contact-handle">@cozymef <span>↗</span></span></div></div>
      </section>
    </main>

    <footer className="site-footer"><a href="#top" className="footer-mark">cozy<span>/</span>dev</a><span>СДЕЛАНО С ЛЮБОПЫТСТВОМ, НЕ С ВИДОМ ЭКСПЕРТА.</span><a href="#top">НАВЕРХ ↑</a><span>© 2026</span></footer>
    <motion.div className="side-scroll" style={{ y: smoothY }} aria-hidden="true" />
  </div>;
}
