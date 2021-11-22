#include "quickjs-libc-min.h"
#include "code.h"
#include "call_hello_code.h"
#include "call_decrement_code.h"
#include "call_increment_code.h"
#include "call_reset_code.h"
#include "call_get_num_code.h"

static JSContext *JS_NewCustomContext(JSRuntime *rt)
{
  JSContext *ctx = JS_NewContextRaw(rt);
  if (!ctx)
    return NULL;
  JS_AddIntrinsicBaseObjects(ctx);
  return ctx;
}

extern void log_utf8(uint64_t len, uint64_t ptr);
extern uint64_t storage_write(uint64_t key_len, uint64_t key_ptr, uint64_t value_len, uint64_t value_ptr, uint64_t register_id);
extern uint64_t storage_read(uint64_t key_len, uint64_t key_ptr, uint64_t register_id);
extern void read_register(uint64_t register_id, uint64_t ptr);
extern void value_return(uint64_t value_len, uint64_t value_ptr);

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

static JSValue near_storage_write(JSContext *ctx, JSValueConst this_val,
                                  int argc, JSValueConst *argv)
{
  const char *key_ptr, *value_ptr;
  size_t key_len, value_len;

  if (argc < 2) {
    return JS_EXCEPTION;
  }
  key_ptr = JS_ToCStringLen(ctx, &key_len, argv[0]);
  value_ptr = JS_ToCStringLen(ctx, &value_len, argv[1]);
  storage_write(key_len, key_ptr, value_len, value_ptr, 0);
  return JS_UNDEFINED;
}

static JSValue near_storage_read(JSContext *ctx, JSValueConst this_val,
                                 int argc, JSValueConst *argv)
{
  const char *key_ptr;
  size_t key_len;
  uint64_t register_id;

  if (argc < 2) {
    return JS_EXCEPTION;
  }
  key_ptr = JS_ToCStringLen(ctx, &key_len, argv[0]);
  JS_ToInt64(ctx, &register_id, argv[1]);
  return JS_NewInt32(ctx, storage_read(key_len, key_ptr, register_id));
}

static JSValue near_read_register(JSContext *ctx, JSValueConst this_val,
                                  int argc, JSValueConst *argv)
{
  uint64_t register_id;
  char *data[1000];

  JS_ToInt64(ctx, &register_id, argv[0]);
  read_register(register_id, data);
  return JS_NewString(ctx, data);
}


static JSValue near_value_return(JSContext *ctx, JSValueConst this_val,
                                  int argc, JSValueConst *argv) {
  const char *value_ptr;
  size_t value_len;
  value_ptr = JS_ToCStringLen(ctx, &value_len, argv[0]);
  value_return(value_len, value_ptr);
}

static void js_add_near_host_functions(JSContext* ctx) {
  JSValue global_obj, env;

  global_obj = JS_GetGlobalObject(ctx);
  env = JS_NewObject(ctx);
  JS_SetPropertyStr(ctx, env, "log",
                    JS_NewCFunction(ctx, near_log, "near_log", 1));
  JS_SetPropertyStr(ctx, env, "storage_write",
                    JS_NewCFunction(ctx, near_storage_write, "near_storage_write", 2));
  JS_SetPropertyStr(ctx, env, "storage_read",
                    JS_NewCFunction(ctx, near_storage_read, "near_storage_read", 2));
  JS_SetPropertyStr(ctx, env, "read_register",
                    JS_NewCFunction(ctx, near_read_register, "near_read_register", 1));
  JS_SetPropertyStr(ctx, env, "value_return",
                    JS_NewCFunction(ctx, near_value_return, "near_value_return", 1));
  JS_SetPropertyStr(ctx, global_obj, "env", env);
}

void hello() {
  JSRuntime *rt;
  JSContext *ctx;
  rt = JS_NewRuntime();
  // js_std_set_worker_new_context_func(JS_NewCustomContext); // for sure not needed
  // js_std_init_handlers(rt); // not needed in hello world
  ctx = JS_NewCustomContext(rt);
  js_std_add_helpers(ctx, 0, NULL);
  js_add_near_host_functions(ctx);
  js_std_eval_binary(ctx, code, code_size, 0);
  js_std_eval_binary(ctx, qjsc_call_hello, qjsc_call_hello_size, 0);

  // js_std_loop(ctx); // not needed in hello world
  // JS_FreeContext(ctx); // can be skipped run as contract
  // JS_FreeRuntime(rt);  // same
}


void increment() {
  JSRuntime *rt;
  JSContext *ctx;
  rt = JS_NewRuntime();
  // js_std_set_worker_new_context_func(JS_NewCustomContext); // for sure not needed
  // js_std_init_handlers(rt); // not needed in hello world
  ctx = JS_NewCustomContext(rt);
  js_std_add_helpers(ctx, 0, NULL);
  js_add_near_host_functions(ctx);
  js_std_eval_binary(ctx, code, code_size, 0);
  js_std_eval_binary(ctx, qjsc_call_increment, qjsc_call_increment_size, 0);

  // js_std_loop(ctx); // not needed in hello world
  // JS_FreeContext(ctx); // can be skipped run as contract
  // JS_FreeRuntime(rt);  // same
}

void decrement() {
  JSRuntime *rt;
  JSContext *ctx;
  rt = JS_NewRuntime();
  // js_std_set_worker_new_context_func(JS_NewCustomContext); // for sure not needed
  // js_std_init_handlers(rt); // not needed in hello world
  ctx = JS_NewCustomContext(rt);
  js_std_add_helpers(ctx, 0, NULL);
  js_add_near_host_functions(ctx);
  js_std_eval_binary(ctx, code, code_size, 0);
  js_std_eval_binary(ctx, qjsc_call_decrement, qjsc_call_decrement_size, 0);

  // js_std_loop(ctx); // not needed in hello world
  // JS_FreeContext(ctx); // can be skipped run as contract
  // JS_FreeRuntime(rt);  // same
}

void reset() {
  JSRuntime *rt;
  JSContext *ctx;
  rt = JS_NewRuntime();
  // js_std_set_worker_new_context_func(JS_NewCustomContext); // for sure not needed
  // js_std_init_handlers(rt); // not needed in hello world
  ctx = JS_NewCustomContext(rt);
  js_std_add_helpers(ctx, 0, NULL);
  js_add_near_host_functions(ctx);
  js_std_eval_binary(ctx, code, code_size, 0);
  js_std_eval_binary(ctx, qjsc_call_reset, qjsc_call_reset_size, 0);

  // js_std_loop(ctx); // not needed in hello world
  // JS_FreeContext(ctx); // can be skipped run as contract
  // JS_FreeRuntime(rt);  // same
}

void get_num() {
  JSRuntime *rt;
  JSContext *ctx;
  rt = JS_NewRuntime();
  // js_std_set_worker_new_context_func(JS_NewCustomContext); // for sure not needed
  // js_std_init_handlers(rt); // not needed in hello world
  ctx = JS_NewCustomContext(rt);
  js_std_add_helpers(ctx, 0, NULL);
  js_add_near_host_functions(ctx);
  js_std_eval_binary(ctx, code, code_size, 0);
  js_std_eval_binary(ctx, qjsc_call_get_num, qjsc_call_get_num_size, 0);

  // js_std_loop(ctx); // not needed in hello world
  // JS_FreeContext(ctx); // can be skipped run as contract
  // JS_FreeRuntime(rt);  // same
}

void _start() {
}
