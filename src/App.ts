import Component from './core/component';
import { html } from './core/html';
import signal from './core/signal';

const counterSignal = signal(0);

class CounterSignal extends Component {
    constructor() {
        super();
        this.addSignal(counterSignal);
    }
    render(): HTMLElement {
        return html`<h2>Counter: ${counterSignal.get}</h2>`;
    }
}

class App extends Component {
    render(): HTMLElement {
        return html` <div style="display: contents;">
            <nav>
                <a href="#" class="logo ">
                    <div class="logo-container">
                        <img src="/logo.png" />
                        <p>Qyber</p>
                    </div>
                </a>
                <ul>
                    <li><a href="#features">Features</a></li>
                    <li><a href="#getting-started">Getting Started</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </nav>

            <header>
                <h1>Welcome to <span class="hight-light">Qyber</span></h1>
                <p>
                    Elegant, modern UI library for building sophisticated web
                    applications effortlessly.
                </p>
            </header>

            <div class="content">
                <section id="features" class="features">
                    <div class="feature">
                        <h3>Component</h3>
                        <p>
                            Break down your UI into modular, reusable parts.
                            Manage lifecycle events with ease.
                        </p>
                    </div>
                    <div class="feature">
                        <h3>Signal</h3>
                        <p>
                            Real-time data synchronization to update the UI
                            instantly whenever state changes.
                        </p>
                    </div>
                    <div class="feature">
                        <h3>Router</h3>
                        <p>
                            Smooth navigation between pages without page
                            reloads. Performance-driven routing.
                        </p>
                    </div>
                </section>

                <section id="getting-started" class="getting-started">
                    <h2>Getting Started</h2>
                    <p>Create a simple signal to manage state.</p>
                    <img src="/logo.png" class="first-logo" />
                    <p class="title-lib">Qyber</p>

                    <div class="box-signal">
                        <div class="signal-counter">${CounterSignal.r()}</div>
                        <button
                            class="signal-button"
                            onclick=${() => counterSignal.set((pre) => pre + 1)}
                        >
                            Click
                        </button>
                    </div>
                </section>
                <section id="getting-started" class="getting-started">
                    <h2>Qick Started</h2>
                    <p>
                        Building modern applications has never been easier.
                        Follow these steps to get started with Qyber:
                    </p>
                    <p>
                        <strong>Step 1:</strong> Install Qyber in your project.
                    </p>
                    <p>
                        <strong>Step 2:</strong> Create reusable components and
                        manage state with Signals.
                    </p>
                    <p>
                        <strong>Step 3:</strong> Define routes and enjoy smooth
                        navigation without reloads.
                    </p>
                    <a
                        href="https://github.com/quoc-bao-dev/qyber-library.git"
                        class="cta-button"
                        >Get Started</a
                    >
                </section>

                <section id="testimonials" class="testimonials">
                    <h2>What Our Users Say</h2>
                    <div class="testimonial-box">
                        <p>
                            "Qyber revolutionized the way we build applications.
                            It's simple yet powerful!"
                        </p>
                        <p class="author">- A Satisfied Developer</p>
                    </div>
                    <div class="testimonial-box">
                        <p>
                            "I loved how intuitive it was to get started. Qyber
                            has saved me countless hours."
                        </p>
                        <p class="author">- Another Happy User</p>
                    </div>
                </section>
            </div>

            <footer id="contact">
                <p>
                    &copy; 2024 Qyber UI Library. All rights reserved.
                    <a href="#">Privacy Policy</a>
                </p>
            </footer>
        </div>`;
    }
}

export default App;
