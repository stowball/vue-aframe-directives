const plugin = {
  install: function install(Vue) {
    Vue.directive('a-on', {
      bind(el, binding, vnode) {
        const listener = (event) => {
          const args = [event, ...Array.isArray(binding.value) ? binding.value : [binding.value]];
          const { emit, ...modifiers } = binding.modifiers;
          const methodToCall = Object.keys(modifiers)[0];

          if (!methodToCall) {
            return;
          }

          if (emit) {
            vnode.context.$emit(methodToCall, ...args);
          }
          else {
            vnode.context[methodToCall].apply(null, args);
          }
        };

        el.addListener = () => {
          el.addEventListener(binding.arg, listener);
        };

        el.removeListener = () => {
          el.removeEventListener(binding.arg, listener);
        }
      },
      inserted(el) {
        el.addListener();
      },
      unbind(el) {
        el.removeListener();
      },
    });

    Vue.directive('a-bind', (el, binding) => {
      const attr = binding.arg;
      const value = binding.value;

      if (value === null || value === undefined) {
        el.removeAttribute(attr);
      }
      else if (attr === 'position' || attr === 'scale') {
        if (typeof value === 'object' && !Array.isArray(value)) {
          Object.keys(value).forEach((key) => {
            el.object3D[attr][key] = value[key];
          });
        }
        else {
          const [x, y, z] = Array.isArray(value) ? value : value.split(' ').map((val) => Number(val));

          el.object3D[attr].set(x, y, z);
        }
      }
      else if (attr === 'rotation') {
        if (typeof value === 'object' && !Array.isArray(value)) {
          Object.keys(value).forEach((key) => {
            el.object3D.rotation[key] = value[key];
          });
        }
        else {
          const [x, y, z] = Array.isArray(value) ? value : value.split(' ').map((val) => Number(val));

          el.object3D.rotation.set(
            THREE.Math.degToRad(x),
            THREE.Math.degToRad(y),
            THREE.Math.degToRad(z)
          );
        }
      }
      else if (attr === 'visible') {
        el.object3D.visible = value;
      }
      else {
        const args = [attr, ...Array.isArray(value) ? value : [value.toString()]];

        el.setAttribute.apply(el, args);
      }
    });
  },
};

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(plugin);
}

export default plugin;
