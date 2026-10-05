/* ============================================================
   ============================================================
   01. FIREBASE CONFIGURATION
   ============================================================
   ============================================================ */

const firebaseConfig = {

apiKey: "AIzaSyDykM2omZ68HY7EEJjPiG16jXbPGW0bYSA",
      authDomain: "domek-52b6a.firebaseapp.com",
      databaseURL: "https://domek-52b6a-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "domek-52b6a",
      storageBucket: "domek-52b6a.firebasestorage.app",
      messagingSenderId: "641050671936",
      appId: "1:641050671936:web:47d40c3fa12f39962c98a5"

};


/* ============================================================
   02. FIREBASE INIT
   ============================================================ */

firebase.initializeApp(firebaseConfig);

const db =
  firebase.database();

const auth =
  firebase.auth();


/* ============================================================
   03. KONFIGURACJA APLIKACJI
   ============================================================ */

const APP_CONFIG = {

  rooms: [
    "biurko",
    "salon",
    "kuchnia",
    "sypialnia",
    "pracownia"
  ],

  garage: {

    devices: {

      wiertarkaStolowa: {

        name:
          "Wiertarka stołowa",

        databasePath:
          "garage/wiertarkaStolowa",

        speed: {

          min:
            20,

          max:
            80,

          step:
            1,

          unit:
            "Hz",

          /*
           * Przelicznik:
           *
           * 0% -> 0 RPM
           * 100% -> 3000 RPM
           *
           * Jeżeli sterownik wymaga np.
           * 0–4095 zamiast 0–100,
           * można to zmienić tutaj.
           */

          controlMin:
            20,

          controlMax:
            80

        }

      }

    }

  }

};


/* ============================================================
   04. ISTNIEJĄCE ŚCIEŻKI FIREBASE
   ============================================================
   WAŻNE:
   Tych wartości NIE ZMIENIAMY.
   ============================================================ */

const EXISTING_RELAY_PATHS = {

  biurko: [

    "biurko/b0",
    "biurko/b1",
    "biurko/b2",

    /*
     * Zachowane dokładnie tak,
     * jak w oryginalnym projekcie.
     */

    "salon/s0",
    "salon/s1",
    "salon/s2",

    "biurko/b3"

  ],

  salon: [

    "salon/s0",
    "salon/s1",
    "salon/s2",

    "salon/g0",
    "salon/g1",
    "salon/g2"

  ],

  kuchnia: [

    "kuchnia/k0",
    "kuchnia/k1",
    "kuchnia/k2",

    "kuchnia/g0",
    "kuchnia/g1",
    "kuchnia/g2"

  ],

  sypialnia: [

    "sypialnia/p0",
    "sypialnia/p1",
    "sypialnia/p2",

    "sypialnia/g0",
    "sypialnia/g1",
    "sypialnia/g2"

  ],

  pracownia: [

    "pracownia/w0",
    "pracownia/w1",
    "pracownia/w2",

    "pracownia/g0",
    "pracownia/g1",
    "pracownia/g2"

  ]

};


/* ============================================================
   05. POMOCNICZE FUNKCJE UI
   ============================================================ */

const UI = {

  $(selector) {
    return document.querySelector(selector);
  },

  $$(selector) {
    return document.querySelectorAll(selector);
  },

  show(element) {
    element.classList.remove("hidden");
  },

  hide(element) {
    element.classList.add("hidden");
  },

  toast(message) {

    const toast =
      this.$("#toast");

    const text =
      this.$("#toastText");

    text.textContent =
      message;

    toast.classList.add("show");

    clearTimeout(
      this.toastTimer
    );

    this.toastTimer =
      setTimeout(() => {

        toast.classList.remove(
          "show"
        );

      }, 2500);

  }

};


/* ============================================================
   06. NAWIGACJA GŁÓWNA
   ============================================================ */

const Navigation = {

  init() {

    UI.$$(".main-nav-btn")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            this.open(
              button.dataset.section
            );

          }
        );

      });

  },


  open(section) {

    UI.$$(".main-nav-btn")
      .forEach(button => {

        button.classList.toggle(
          "active",
          button.dataset.section === section
        );

      });


    UI.$$(".app-section")
      .forEach(element => {

        element.classList.remove(
          "active"
        );

      });


    const target =
      section === "garage"
        ? UI.$("#garageSection")
        : UI.$("#homeSection");


    target.classList.add(
      "active"
    );

  }

};


/* ============================================================
   07. ZARZĄDZANIE POKOJAMI
   ============================================================ */

const Rooms = {

  states: {},


  init() {

    this.initTabs();

    this.initRelays();

  },


  initTabs() {

    UI.$$(".room-tab")
      .forEach(tab => {

        tab.addEventListener(
          "click",
          () => {

            UI.$$(".room-tab")
              .forEach(t =>
                t.classList.remove("active")
              );

            UI.$$(".room-panel")
              .forEach(panel =>
                panel.classList.remove("active")
              );


            tab.classList.add(
              "active"
            );


            const panel =
              UI.$(
                `#room-${tab.dataset.room}`
              );


            panel.classList.add(
              "active"
            );

          }
        );

      });

  },


  initRelays() {

    Object.entries(
      EXISTING_RELAY_PATHS
    ).forEach(
      ([room, paths]) => {

        this.states[room] = {};


        paths.forEach(path => {

          const ref =
            db.ref(path);


          ref.on(
            "value",
            snapshot => {

              const value =
                snapshot.val() === true;


              this.states[room][path] =
                value;


              this.updateRelayCards(
                path,
                value
              );


              this.updateMasterButton(
                room
              );

            }
          );

        });


        const masterButton =
          document.querySelector(
            `.room-master-button[data-room="${room}"]`
          );


        masterButton.addEventListener(
          "click",
          () => {

            this.toggleAll(
              room
            );

          }
        );

      }
    );

  },


  updateRelayCards(path, isOn) {

    UI.$$(
      `.relay-card[data-path="${path}"]`
    ).forEach(card => {

      card.classList.toggle(
        "on",
        isOn
      );


      const status =
        card.querySelector(
          ".relay-status"
        );


      if (status) {

        status.textContent =
          isOn
            ? "WŁĄCZONE"
            : "WYŁĄCZONE";

      }

    });

  },


  updateMasterButton(room) {

    const paths =
      EXISTING_RELAY_PATHS[room];


    const states =
      paths.map(
        path =>
          this.states[room]?.[path] === true
      );


    const allOn =
      states.length > 0 &&
      states.every(Boolean);


    const button =
      document.querySelector(
        `.room-master-button[data-room="${room}"]`
      );


    if (!button) return;


    button.textContent =
      allOn
        ? "Wyłącz wszystko"
        : "Włącz wszystko";

  },


  async toggleAll(room) {

    const paths =
      EXISTING_RELAY_PATHS[room];


    const allOn =
      paths.every(
        path =>
          this.states[room]?.[path] === true
      );


    const target =
      !allOn;


    const updates = {};


    paths.forEach(path => {

      updates[path] =
        target;

    });


    try {

      await db.ref().update(
        updates
      );

    } catch (error) {

      console.error(error);

      UI.toast(
        "Nie udało się zmienić stanu."
      );

    }

  }

};


/* ============================================================
   08. KLASA PRZEŁĄCZNIKA BISTABILNEGO
   ============================================================ */

class BinarySelector {

  constructor(options) {

    this.buttons =
      options.buttons;

    this.path =
      options.path;

    this.onValue =
      options.onValue;

    this.offValue =
      options.offValue;

    this.onChange =
      options.onChange || (() => {});

    this.init();

  }


  init() {

    this.buttons.forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const value =
              button.dataset.value;

            this.write(
              value
            );

          }
        );

      }
    );


    db.ref(this.path).on(
      "value",
      snapshot => {

        this.setActive(
          String(snapshot.val())
        );

      }
    );

  }


  async write(value) {

    try {

      await db
        .ref(this.path)
        .set(
          value === "true"
            ? true
            : value === "false"
              ? false
              : value
        );

    } catch (error) {

      console.error(error);

      UI.toast(
        "Nie udało się zmienić ustawienia."
      );

    }

  }


  setActive(value) {

    this.buttons.forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.value === value
        );

      }
    );


    this.onChange(
      value
    );

  }

}


/* ============================================================
   09. PRZYCISK MONOSTABILNY
   ============================================================
   Działanie:
   kliknięcie -> true
   po krótkim czasie -> false
   ============================================================ */

class MomentaryButton {

  constructor(options) {

    this.button =
      options.button;

    this.path =
      options.path;

    this.duration =
      options.duration || 250;

    this.init();

  }


  init() {

    this.button.addEventListener(
      "click",
      () => this.press()
    );

  }


  async press() {

    try {

      this.button.classList.add(
        "pressed"
      );


      await db
        .ref(this.path)
        .set(true);


      setTimeout(
        async () => {

          try {

            await db
              .ref(this.path)
              .set(false);

          } catch (error) {

            console.error(error);

          }

        },

        this.duration
      );


    } catch (error) {

      console.error(error);

      UI.toast(
        "Nie udało się wysłać komendy."
      );

    } finally {

      setTimeout(
        () => {

          this.button.classList.remove(
            "pressed"
          );

        },

        180
      );

    }

  }

}


/* ============================================================
   10. SUWAK PÓŁOKRĄGŁY
   ============================================================ */

class ArcSlider {

  constructor(options) {

    this.container =
      options.container;

    this.knob =
      options.knob;

    this.progress =
      options.progress;

    this.min =
      options.min;

    this.max =
      options.max;

    this.step =
      options.step;

    this.onChange =
      options.onChange || (() => {});

    this.value =
      0;

    this.dragging =
      false;

    this.path =
      options.path;

    this.init();

  }


  init() {

    this.container.addEventListener(
      "pointerdown",
      event => {

        this.dragging =
          true;

        this.container.setPointerCapture(
          event.pointerId
        );

        this.updateFromPointer(
          event
        );

      }
    );


    this.container.addEventListener(
      "pointermove",
      event => {

        if (!this.dragging) return;

        this.updateFromPointer(
          event
        );

      }
    );


    this.container.addEventListener(
      "pointerup",
      event => {

        this.dragging =
          false;

        try {

          this.container.releasePointerCapture(
            event.pointerId
          );

        } catch (_) {}

      }
    );


    this.container.addEventListener(
      "pointercancel",
      () => {

        this.dragging =
          false;

      }
    );


    /*
     * Kliknięcie / zmiana wartości
     * z Firebase.
     */

    db.ref(this.path).on(
      "value",
      snapshot => {

        const value =
          Number(snapshot.val());


        if (
          Number.isFinite(value)
        ) {

          this.setValue(
            value,
            false
          );

        }

      }
    );

  }


  updateFromPointer(event) {

    const rect =
      this.container.getBoundingClientRect();


    /*
     * Środek łuku.
     *
     * W SVG:
     * łuk biegnie od lewej do prawej
     * przez górną część okręgu.
     */

    const centerX =
      rect.left +
      rect.width / 2;


    const centerY =
      rect.top +
      rect.height * 0.82;


    const x =
      event.clientX -
      centerX;


    const y =
      event.clientY -
      centerY;


    let angle =
      Math.atan2(
        y,
        x
      );


    /*
     * Przekształcamy kąt tak,
     * aby zakres wynosił:
     *
     * 180° -> 0°
     *   0° -> 100%
     */

    let degrees =
      angle * 180 / Math.PI;


    degrees =
      Math.max(
        0,
        Math.min(
          180,
          degrees
        )
      );


    let percentage =
      1 -
      degrees / 180;


    /*
     * Odwrócenie zgodnie z układem
     * współrzędnych ekranu.
     */

    if (y > 0) {

      percentage =
        0;

    }


    /*
     * Alternatywny, stabilniejszy
     * sposób liczenia pozycji
     * dla górnej połowy.
     */

    const normalizedX =
      Math.max(
        -1,
        Math.min(
          1,
          x /
          (rect.width * 0.39)
        )
      );


    let upper =
      Math.sqrt(
        Math.max(
          0,
          1 -
          normalizedX * normalizedX
        )
      );


    let visualPercentage =
      (normalizedX + 1) / 2;


    /*
     * Gdy punkt znajduje się powyżej
     * środka, wykorzystujemy jego
     * położenie na łuku.
     */

    if (
      y <= 0 &&
      upper >= 0
    ) {

      visualPercentage =
        (normalizedX + 1) / 2;

    }


    /*
     * Lewa strona = minimum
     * Prawa strona = maksimum.
     */

    const value =
      this.min +
      visualPercentage *
      (this.max - this.min);


    this.setValue(
      value,
      true
    );

  }


  setValue(value, writeToFirebase = false) {

    value =
      Math.max(
        this.min,
        Math.min(
          this.max,
          value
        )
      );


    /*
     * Zaokrąglenie do kroku.
     */

    value =
      Math.round(
        value / this.step
      ) * this.step;


    this.value =
      value;


    const percentage =
      (value - this.min) /
      (this.max - this.min);


    this.render(
      percentage
    );


    this.onChange(
      value,
      percentage
    );


    if (writeToFirebase) {

      this.write(
        value
      );

    }

  }


  render(percentage) {

    const clamped =
      Math.max(
        0,
        Math.min(
          1,
          percentage
        )
      );


    /*
     * Długość łuku ~ 488.
     */

    const circumference =
      488;


    this.progress.style.strokeDashoffset =
      circumference *
      (1 - clamped);


    /*
     * Pozycja gałki.
     *
     * Ten układ odpowiada
     * wizualnemu półokręgowi.
     */

    const angle =
      Math.PI -
      Math.PI *
      clamped;


    const centerX =
      50;

    const centerY =
      83;//82;


    const radiusX =
      32;//39;


    const radiusY =
      62;


    const x =
      centerX +
      Math.cos(angle) *
      radiusX;


    const y =
      centerY -
      Math.sin(angle) *
      radiusY;


    this.knob.style.left =
      `${x}%`;


    this.knob.style.top =
      `${y}%`;

  }


  async write(value) {

    try {

      await db
        .ref(this.path)
        .set(value);

    } catch (error) {

      console.error(error);

      UI.toast(
        "Nie udało się ustawić prędkości."
      );

    }

  }

}


/* ============================================================
   11. MODUŁ WIERTARKI
   ============================================================ */

const DrillMachine = {

  config:
    APP_CONFIG.garage.devices.wiertarkaStolowa,

  slider:
    null,


  init() {

    const base =
      this.config.databasePath;


    /*
     * ================================================
     * SUWAK
     * ================================================
     */

    const speed =
      this.config.speed;


    this.slider =
      new ArcSlider({

        container:
          UI.$("#arcSlider"),

        knob:
          UI.$("#arcKnob"),

        progress:
          UI.$("#arcProgress"),

        min:
          speed.min,

        max:
          speed.max,

        step:
          speed.step,

        path:
          `${base}/speed`,

        onChange:
          (value, percentage) => {

            this.updateSpeedUI(
              value,
              percentage
            );

          }

      });


    /*
     * ================================================
     * OBROTY
     * ================================================
     */

    new BinarySelector({

      buttons:
        [
          ...UI.$$(
            '[data-device-path="direction"]'
          )
        ],

      path:
        `${base}/direction`,

      onChange:
        value => {

          UI.$("#directionText")
            .textContent =
              value === "left"
                ? "LEWE"
                : "PRAWE";

        }

    });


    /*
     * ================================================
     * STEROWANIE
     * ================================================
     */

    new BinarySelector({

      buttons:
        [
          ...UI.$$(
            '[data-device-path="controlMode"]'
          )
        ],

      path:
        `${base}/controlMode`,

      onChange:
        value => {

          UI.$("#controlModeText")
            .textContent =
              value === "local"
                ? "LOKALNE"
                : "ZDALNE";

        }

    });


    /*
     * ================================================
     * AUTOSTART
     * ================================================
     */

    new BinarySelector({

      buttons:
        [
          ...UI.$$(
            '[data-device-path="autostart"]'
          )
        ],

      path:
        `${base}/autostart`,

      onChange:
        value => {

          UI.$("#autostartText")
            .textContent =
              value === "true"
                ? "AKTYWNY"
                : "NIEAKTYWNY";

        }

    });


    /*
     * ================================================
     * START
     * ================================================
     */

    new MomentaryButton({

      button:
        UI.$(
          '[data-command="start"]'
        ),

      path:
        `${base}/commands/start`,

      duration:
        250

    });


    /*
     * ================================================
     * STOP
     * ================================================
     */

    new MomentaryButton({

      button:
        UI.$(
          '[data-command="stop"]'
        ),

      path:
        `${base}/commands/stop`,

      duration:
        250

    });


    /*
     * ================================================
     * WYŁĄCZ
     * ================================================
     */

    new MomentaryButton({

      button:
        UI.$(
          '[data-command="powerOff"]'
        ),

      path:
        `${base}/commands/powerOff`,

      duration:
        250

    });


    /*
     * ================================================
     * STATUS MASZYNY
     * ================================================
     */

    this.initStatus(
      base
    );


    /*
     * ================================================
     * LABELKI ZAKRESU
     * ================================================
     */

    UI.$("#arcMinLabel")
      .textContent =
        speed.min;


    UI.$("#arcMaxLabel")
      .textContent =
        speed.max;


    UI.$("#speedRangeText")
      .textContent =
        `${speed.min}–${speed.max} ${speed.unit}`;


    UI.$("#speedUnit")
      .textContent =
        speed.unit;

  },


  updateSpeedUI(
    value,
    percentage
  ) {

    const speed =
      this.config.speed;


    UI.$("#speedValue")
      .textContent =
        Math.round(value);


    UI.$("#speedPercent")
      .textContent =
        `${Math.round(
          percentage * 100
        )}%`;


    /*
     * Wartość sterowania
     * w zakresie controlMin/controlMax.
     */

    const controlRange =
      speed.controlMax -
      speed.controlMin;


    const controlValue =
      speed.controlMin +
      percentage *
      controlRange;


    UI.$("#controlValue")
      .textContent =
        Math.round(
          controlValue
        );


    UI.$("#machineValue")
      .textContent =
        `${Math.round(value)} ${speed.unit}`;

  },


  initStatus(base) {

    const statusRef =
      db.ref(
        `${base}/status`
      );


    statusRef.on(
      "value",
      snapshot => {

        const status =
          snapshot.val() || {};


        this.renderStatus(
          status
        );

      }
    );

  },


  renderStatus(status) {

    const state =
      status.state ||
      "ready";


    const stateElement =
      UI.$("#drillState");


    const textElement =
      UI.$("#drillStateText");


    stateElement.className =
      "machine-state";


    if (state === "running") {

      stateElement.classList.add(
        "state-running"
      );

      textElement.textContent =
        "PRACUJE";

    }

    else if (state === "stopped") {

      stateElement.classList.add(
        "state-stopped"
      );

      textElement.textContent =
        "ZATRZYMANA";

    }

    else {

      stateElement.classList.add(
        "state-ready"
      );

      textElement.textContent =
        "GOTOWA";

    }


    if (status.updatedAt) {

      const date =
        new Date(
          status.updatedAt
        );


      UI.$("#lastUpdate")
        .textContent =
          date.toLocaleTimeString(
            "pl-PL"
          );

    }

  }

};


/* ============================================================
   12. FIREBASE CONNECTION STATUS
   ============================================================ */

const Connection = {

  init() {

    const connectedRef =
      db.ref(".info/connected");


    connectedRef.on(
      "value",
      snapshot => {

        const online =
          snapshot.val() === true;


        const dot =
          UI.$("#connectionDot");


        const text =
          UI.$("#connectionText");


        dot.classList.toggle(
          "online",
          online
        );


        text.textContent =
          online
            ? "Połączono"
            : "Brak połączenia";

      }
    );

  }

};


/* ============================================================
   13. LOGOWANIE
   ============================================================ */

const Authentication = {

  init() {

    UI.$("#loginForm")
      .addEventListener(
        "submit",
        event => {

          event.preventDefault();

          this.login();

        }
      );


    UI.$("#logoutBtn")
      .addEventListener(
        "click",
        () => {

          auth.signOut();

        }
      );


    auth.onAuthStateChanged(
      user => {

        if (user) {

          this.showApplication();

        } else {

          this.showLogin();

        }

      }
    );

  },


  async login() {

    const email =
      UI.$("#email")
        .value
        .trim();


    const password =
      UI.$("#password")
        .value;


    const error =
      UI.$("#loginError");


    error.textContent =
      "";


    if (!email || !password) {

      error.textContent =
        "Podaj e-mail i hasło.";

      return;

    }


    try {

      await auth
        .signInWithEmailAndPassword(
          email,
          password
        );

    } catch (err) {

      console.error(err);

      error.textContent =
        this.translateError(
          err.code
        );

    }

  },


  translateError(code) {

    const errors = {

      "auth/invalid-email":
        "Nieprawidłowy adres e-mail.",

      "auth/user-disabled":
        "To konto jest zablokowane.",

      "auth/user-not-found":
        "Nie znaleziono użytkownika.",

      "auth/wrong-password":
        "Nieprawidłowe hasło.",

      "auth/invalid-credential":
        "Nieprawidłowe dane logowania.",

      "auth/too-many-requests":
        "Zbyt wiele prób. Spróbuj później."

    };


    return (
      errors[code] ||
      "Nie udało się zalogować."
    );

  },


  showApplication() {

    UI.hide(
      UI.$("#loginScreen")
    );


    UI.show(
      UI.$("#app")
    );

  },


  showLogin() {

    UI.hide(
      UI.$("#app")
    );


    UI.show(
      UI.$("#loginScreen")
    );

  }

};


/* ============================================================
   14. START APLIKACJI
   ============================================================ */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    Navigation.init();

    Rooms.init();

    DrillMachine.init();

    Connection.init();

    Authentication.init();

  }
);
