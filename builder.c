#include "quickjs-libc-min.h"
#include "code.h"

static JSContext *JS_NewCustomContext(JSRuntime *rt)
{
  JSContext *ctx = JS_NewContextRaw(rt);
  if (!ctx)
    return NULL;
  JS_AddIntrinsicBaseObjects(ctx);
  return ctx;
}

int main(int argc, char **argv)
{
  JSRuntime *rt;
  JSContext *ctx;
  rt = JS_NewRuntime();
  // js_std_set_worker_new_context_func(JS_NewCustomContext); // for sure not needed
  // js_std_init_handlers(rt); // not needed in hello world
  ctx = JS_NewCustomContext(rt);
  js_std_add_helpers(ctx, argc, argv);
  js_std_eval_binary(ctx, code, code_size, 0);
  // js_std_loop(ctx); // not needed in hello world
  JS_FreeContext(ctx); // can be skipped run as contract
  JS_FreeRuntime(rt);  // same
  return 0;
}

void _start() {
  main(0, NULL);
}

// for run by near-vm-runner-standalone
void hello() {
  main(0, NULL);
}
