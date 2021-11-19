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

extern void log_utf8(uint64_t len, uint64_t ptr);

static JSValue near_log(JSContext *ctx, JSValueConst this_val,
                              int argc, JSValueConst *argv)
{
  int i;
  const char *str;
  size_t len;

  for(i = 0; i < argc; i++) {
      if (i != 0)
          log_utf8(1, " ");
      str = JS_ToCStringLen(ctx, &len, argv[i]);
      if (!str)
          return JS_EXCEPTION;
      log_utf8(len, str);
      JS_FreeCString(ctx, str);
  }
  return JS_UNDEFINED;
}

static void js_add_near_host_functions(JSContext* ctx) {
  JSValue global_obj, env;

  global_obj = JS_GetGlobalObject(ctx);
  env = JS_NewObject(ctx);
  JS_SetPropertyStr(ctx, env, "log",
                    JS_NewCFunction(ctx, near_log, "near_log", 1));
  JS_SetPropertyStr(ctx, global_obj, "env", env);
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
  js_add_near_host_functions(ctx);
  js_std_eval_binary(ctx, code, code_size, 0);
  // js_std_loop(ctx); // not needed in hello world
  // JS_FreeContext(ctx); // can be skipped run as contract
  // JS_FreeRuntime(rt);  // same
  return 0;
}

void _start() {
  main(0, NULL);
}

// for run by near-vm-runner-standalone
void hello() {
  main(0, NULL);
}
