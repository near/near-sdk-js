#include "quickjs-libc-min.h"
#include "code.h"

static JSContext *JS_NewCustomContext(JSRuntime *rt)
{
  JSContext *ctx = JS_NewContextRaw(rt);
  if (!ctx)
    return NULL;
  JS_AddIntrinsicBaseObjects(ctx);
  JS_AddIntrinsicDate(ctx);
  JS_AddIntrinsicEval(ctx);
  JS_AddIntrinsicStringNormalize(ctx);
  JS_AddIntrinsicRegExp(ctx);
  JS_AddIntrinsicJSON(ctx);
  JS_AddIntrinsicProxy(ctx);
  JS_AddIntrinsicMapSet(ctx);
  JS_AddIntrinsicTypedArrays(ctx);
  JS_AddIntrinsicPromise(ctx);
  JS_AddIntrinsicBigInt(ctx);
  return ctx;
}

#define DEFINE_NEAR_METHOD(name) \
  void name () {\
    JSRuntime *rt;\
    JSContext *ctx;\
    JSValue global_obj, fun_obj;\
    rt = JS_NewRuntime();\
    ctx = JS_NewCustomContext(rt);\
    js_add_near_host_functions(ctx);\
    js_std_eval_binary(ctx, code, code_size, 0);\
    global_obj = JS_GetGlobalObject(ctx);\
    fun_obj = JS_GetProperty(ctx, global_obj, JS_NewAtom(ctx, #name));\
    JS_Call(ctx, fun_obj, global_obj, 0, NULL);\
    js_std_loop(ctx);\
  }

// #############
// # Registers #
// #############
extern void read_register(uint64_t register_id, uint64_t ptr);
extern uint64_t register_len(uint64_t register_id);
extern void write_register(uint64_t register_id, uint64_t data_len, uint64_t data_ptr);
// ###############
// # Context API #
// ###############
extern void current_account_id(uint64_t register_id);
extern void signer_account_id(uint64_t register_id);
extern void signer_account_pk(uint64_t register_id);
extern void predecessor_account_id(uint64_t register_id);
extern void input(uint64_t register_id);
extern uint64_t block_index();
extern uint64_t block_timestamp();
extern uint64_t epoch_height();
extern uint64_t storage_usage();
// #################
// # Economics API #
// #################
extern void account_balance(uint64_t balance_ptr);
extern void account_locked_balance(uint64_t balance_ptr);
extern void attached_deposit(uint64_t balance_ptr);
extern uint64_t prepaid_gas();
extern uint64_t used_gas();
// ############
// # Math API #
// ############
extern void random_seed(uint64_t register_id);
extern void sha256(uint64_t value_len, uint64_t value_ptr, uint64_t register_id);
extern void keccak256(uint64_t value_len, uint64_t value_ptr, uint64_t register_id);
extern void keccak512(uint64_t value_len, uint64_t value_ptr, uint64_t register_id);
extern void ripemd160(uint64_t value_len, uint64_t value_ptr, uint64_t register_id);
extern uint64_t ecrecover(uint64_t hash_len, uint64_t u64, uint64_t sign_len, uint64_t sig_ptr, uint64_t v, uint64_t malleability_flag, uint64_t register_id);
// #####################
// # Miscellaneous API #
// #####################
extern void value_return(uint64_t value_len, uint64_t value_ptr);
extern void panic(void);
extern void panic_utf8(uint64_t len, uint64_t ptr);
extern void log_utf8(uint64_t len, uint64_t ptr);
extern void log_utf16(uint64_t len, uint64_t ptr);
extern void abort(uint32_t mst_ptr, uint32_t filename_ptr, uint32_t u32, uint32_t col);
// ################
// # Promises API #
// ################
extern uint64_t promise_create(uint64_t account_id_len, uint64_t account_id_ptr, uint64_t method_name_len, uint64_t method_name_ptr, uint64_t arguments_len, uint64_t arguments_ptr, uint64_t amount_ptr, uint64_t gas);
extern uint64_t promise_then(uint64_t promise_index, uint64_t account_id_len, uint64_t account_id_ptr, uint64_t method_name_len, uint64_t method_name_ptr, uint64_t arguments_len, uint64_t arguments_ptr, uint64_t amount_ptr, uint64_t gas);
extern uint64_t promise_and(uint64_t promise_idx_ptr, uint64_t promise_idx_count);
extern uint64_t promise_batch_create(uint64_t account_id_len, uint64_t account_id_ptr);
extern uint64_t promise_batch_then(uint64_t promise_index, uint64_t account_id_len, uint64_t account_id_ptr);
// #######################
// # Promise API actions #
// #######################
extern void promise_batch_action_create_account(uint64_t promise_index);
extern void promise_batch_action_deploy_contract(uint64_t promise_index, uint64_t code_len, uint64_t code_ptr);
extern void promise_batch_action_function_call(uint64_t promise_index, uint64_t method_name_len, uint64_t method_name_ptr, uint64_t arguments_len, uint64_t arguments_ptr, uint64_t amount_ptr, uint64_t gas);
extern void promise_batch_action_transfer(uint64_t promise_index, uint64_t amount_ptr);
extern void promise_batch_action_stake(uint64_t promise_index, uint64_t amount_ptr, uint64_t public_key_len, uint64_t public_key_ptr);
extern void promise_batch_action_add_key_with_full_access(uint64_t promise_index, uint64_t public_key_len, uint64_t public_key_ptr, uint64_t nonce);
extern void promise_batch_action_add_key_with_function_call(uint64_t promise_index, uint64_t public_key_len, uint64_t public_key_ptr, uint64_t nonce, uint64_t allowance_ptr, uint64_t receiver_id_len, uint64_t receiver_id_ptr, uint64_t method_names_len, uint64_t method_names_ptr);
extern void promise_batch_action_delete_key(uint64_t promise_index, uint64_t public_key_len, uint64_t public_key_ptr);
extern void promise_batch_action_delete_account(uint64_t promise_index, uint64_t beneficiary_id_len, uint64_t beneficiary_id_ptr);
// #######################
// # Promise API results #
// #######################
extern uint64_t promise_results_count(void);
extern uint64_t promise_result(uint64_t result_idx, uint64_t register_id);
extern void promise_return(uint64_t promise_idx);
// ###############
// # Storage API #
// ###############
extern uint64_t storage_write(uint64_t key_len, uint64_t key_ptr, uint64_t value_len, uint64_t value_ptr, uint64_t register_id);
extern uint64_t storage_read(uint64_t key_len, uint64_t key_ptr, uint64_t register_id);
extern uint64_t storage_remove(uint64_t key_len, uint64_t key_ptr, uint64_t register_id);
extern uint64_t storage_has_key(uint64_t key_len, uint64_t key_ptr);
extern uint64_t storage_iter_prefix(uint64_t prefix_len, uint64_t prefix_ptr);
extern uint64_t storage_iter_range(uint64_t start_len, uint64_t start_ptr, uint64_t end_len, uint64_t end_ptr);
extern uint64_t storage_iter_next(uint64_t iterator_id, uint64_t key_register_id, uint64_t value_register_id);
// #################
// # Validator API #
// #################
extern void validator_stake(uint64_t account_id_len, uint64_t account_id_ptr, uint64_t stake_ptr);
extern void validator_total_stake(uint64_t stake_ptr);
// #############
// # Alt BN128 #
// #############
extern void alt_bn128_g1_multiexp(uint64_t value_len, uint64_t value_ptr, uint64_t register_id);
extern void alt_bn128_g1_sum(uint64_t value_len, uint64_t value_ptr, uint64_t register_id);
extern uint64_t alt_bn128_pairing_check(uint64_t value_len, uint64_t value_ptr);

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

static JSValue near_input(JSContext *ctx, JSValueConst this_val,
                          int argc, JSValueConst *argv)
{
  uint64_t register_id;

  JS_ToInt64(ctx, &register_id, argv[0]);
  input(register_id);
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

static JSValue near_register_len(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t register_id, len;
  char *data[1000];

  JS_ToInt64(ctx, &register_id, argv[0]);
  len = register_len(register_id);
  return JS_NewInt64(ctx, len);
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
  // Has been test success cases in contracts. Failure cases are not.
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
  JS_SetPropertyStr(ctx, env, "input",
                    JS_NewCFunction(ctx, near_input, "near_input", 1));
  // Has not been tested in contracts.
  JS_SetPropertyStr(ctx, env, "register_len",
                    JS_NewCFunction(ctx, near_register_len, "near_register_len", 1));
  
  
  JS_SetPropertyStr(ctx, global_obj, "env", env);
}

JSValue JS_Call(JSContext *ctx, JSValueConst func_obj, JSValueConst this_obj,
                int argc, JSValueConst *argv);

void _start() {
}

#include "methods.h"
