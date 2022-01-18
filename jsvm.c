#include <string.h>
#include <stdbool.h>
#include "quickjs/quickjs-libc-min.h"
#include "quickjs/libbf.h"

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
extern uint64_t ecrecover(uint64_t hash_len, uint64_t hash_ptr, uint64_t sign_len, uint64_t sig_ptr, uint64_t v, uint64_t malleability_flag, uint64_t register_id);
// #####################
// # Miscellaneous API #
// #####################
extern void value_return(uint64_t value_len, uint64_t value_ptr);
extern void panic(void);
extern void panic_utf8(uint64_t len, uint64_t ptr);
extern void log_utf8(uint64_t len, uint64_t ptr);
extern void log_utf16(uint64_t len, uint64_t ptr);
// Name confliction with WASI. Can be re-exported with a different name on NEAR side with a protocol upgrade
// Or, this is actually not a primitive, can be implement with log and panic host functions in C side or JS side. 
// extern void abort(uint32_t msg_ptr, uint32_t filename_ptr, uint32_t u32, uint32_t col);
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
// #################
// # Validator API #
// #################
extern void validator_stake(uint64_t account_id_len, uint64_t account_id_ptr, uint64_t stake_ptr);
extern void validator_total_stake(uint64_t stake_ptr);
// #############
// # Alt BN128 #
// #############
#ifdef NIGHTLY
extern void alt_bn128_g1_multiexp(uint64_t value_len, uint64_t value_ptr, uint64_t register_id);
extern void alt_bn128_g1_sum(uint64_t value_len, uint64_t value_ptr, uint64_t register_id);
extern uint64_t alt_bn128_pairing_check(uint64_t value_len, uint64_t value_ptr);
#endif

static JSValue near_read_register(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t register_id;
  char *data;
  uint64_t data_len;
  JSValue ret;

  if (JS_ToUint64Ext(ctx, &register_id, argv[0]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for register_id");
  }
  data_len = register_len(register_id);
  if (data_len != UINT64_MAX) {
    data = malloc(data_len);
    read_register(register_id, (uint64_t)data);
    ret = JS_NewStringLenRaw(ctx, data, data_len);
    free(data);
    return ret;
  } else {
    return JS_UNDEFINED;
  }
}

static JSValue near_register_len(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t register_id, len;

  if (JS_ToUint64Ext(ctx, &register_id, argv[0]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for register_id");
  }
  len = register_len(register_id);
  return JS_NewBigUint64(ctx, len);
}

static JSValue near_write_register(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t register_id;
  const char *data_ptr;
  size_t data_len;

  if (JS_ToUint64Ext(ctx, &register_id, argv[0]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for register_id");
  }
  data_ptr = JS_ToCStringLenRaw(ctx, &data_len, argv[1]);

  write_register(register_id, data_len, (uint64_t)data_ptr);
  return JS_UNDEFINED;
}

static JSValue near_current_account_id(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t register_id;

  if (JS_ToUint64Ext(ctx, &register_id, argv[0]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for register_id");
  }
  current_account_id(register_id);
  return JS_UNDEFINED;
}

static JSValue near_signer_account_id(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
  uint64_t register_id;

  if (JS_ToUint64Ext(ctx, &register_id, argv[0]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for register_id");
  }
  signer_account_id(register_id);
  return JS_UNDEFINED;
}

static JSValue near_signer_account_pk(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
  uint64_t register_id;

  if (JS_ToUint64Ext(ctx, &register_id, argv[0]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for register_id");
  }
  signer_account_pk(register_id);
  return JS_UNDEFINED;
}

static JSValue near_predecessor_account_id(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
  uint64_t register_id;

  if (JS_ToUint64Ext(ctx, &register_id, argv[0]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for register_id");
  }
  predecessor_account_id(register_id);
  return JS_UNDEFINED;
}

static JSValue near_input(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t register_id;

  if (JS_ToUint64Ext(ctx, &register_id, argv[0]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for register_id");
  }
  input(register_id);
  return JS_UNDEFINED;
}

static JSValue near_block_index(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t value;

  value = block_index();
  return JS_NewBigUint64(ctx, value);
}

static JSValue near_block_timestamp(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t value;

  value = block_timestamp();
  return JS_NewBigUint64(ctx, value);
}

static JSValue near_epoch_height(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t value;

  value = epoch_height();
  return JS_NewBigUint64(ctx, value);
}

static JSValue near_storage_usage(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t value;

  value = storage_usage();
  return JS_NewBigUint64(ctx, value);
}

// ptr[0] ptr[1] is little-endian u128.
static JSValue u128_to_quickjs(JSContext *ctx, uint64_t* ptr) {
  JSValue value;
  bf_t* bn;
  bf_t b;

  value = JS_NewBigInt(ctx);
  bn = JS_GetBigInt(value);
  // from ptr[] to bn
  // high 64 bits
  bf_set_ui(bn, ptr[1]);
  bf_mul_2exp(bn, 64, BF_PREC_INF, BF_RNDZ);
  // low 64 bits
  bf_init(bn->ctx, &b);
  bf_set_ui(&b, ptr[0]);
  bf_add(bn, bn, &b, BF_PREC_INF, BF_RNDZ);
  bf_delete(&b);
  
  return value;
}

static int quickjs_bigint_to_u128(JSContext *ctx, JSValueConst val, uint64_t* ptr) {
  bf_t* a;
  bf_t q, r, b, one, u128max;
  a = JS_GetBigInt(val);
  bf_init(a->ctx, &u128max);
  bf_set_ui(&u128max, 1);
  bf_mul_2exp(&u128max, 128, BF_PREC_INF, BF_RNDZ);
  if (bf_cmp_le(&u128max, a)) {
    return 1;
  }
  bf_init(a->ctx, &q);
  bf_init(a->ctx, &r);
  bf_init(a->ctx, &b);
  bf_init(a->ctx, &one);
  bf_set_ui(&b, UINT64_MAX);
  bf_set_ui(&one, 1);
  bf_add(&b, &b, &one, BF_PREC_INF, BF_RNDZ);
  bf_divrem(&q, &r, a, &b, BF_PREC_INF, BF_RNDZ, BF_RNDZ);
  
  bf_get_uint64(ptr, &r);
  bf_get_uint64(ptr+1, &q);
  return 0;
}

static int quickjs_int_to_u128(JSContext *ctx, JSValueConst val, uint64_t* ptr) {
  if (JS_ToUint64Ext(ctx, ptr, val) < 0) {
    return 1;
  }
  ptr[1] = 0;
  return 0;
}

static int quickjs_to_u128(JSContext *ctx, JSValueConst val, uint64_t* ptr) {
  if (JS_IsBigInt(ctx, val))
    return quickjs_bigint_to_u128(ctx, val, ptr);
  else {
    return quickjs_int_to_u128(ctx, val, ptr);
  }
}

static JSValue near_account_balance(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{  
  uint64_t ptr[2];

  account_balance((uint64_t)ptr); 
  return u128_to_quickjs(ctx, ptr);
}

static JSValue near_account_locked_balance(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t ptr[2];

  account_locked_balance((uint64_t)ptr);
  return u128_to_quickjs(ctx, ptr);
}

static JSValue near_attached_deposit(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t ptr[2];

  attached_deposit((uint64_t)ptr);
  return u128_to_quickjs(ctx, ptr);
}

static JSValue near_prepaid_gas(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t value;

  value = prepaid_gas();
  return JS_NewBigUint64(ctx, value);
}

static JSValue near_used_gas(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t value;

  value = used_gas();
  return JS_NewBigUint64(ctx, value);
}

static JSValue near_random_seed(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t register_id;

  if (JS_ToUint64Ext(ctx, &register_id, argv[0]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for register_id");
  }
  random_seed(register_id);
  return JS_UNDEFINED;
}

static JSValue near_sha256(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t register_id;
  const char *data_ptr;
  size_t data_len;

  data_ptr = JS_ToCStringLenRaw(ctx, &data_len, argv[0]);
  if (JS_ToUint64Ext(ctx, &register_id, argv[1]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for register_id");
  }
  
  sha256(data_len, (uint64_t)data_ptr, register_id);
  return JS_UNDEFINED;
}

static JSValue near_keccak256(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t register_id;
  const char *data_ptr;
  size_t data_len;

  data_ptr = JS_ToCStringLenRaw(ctx, &data_len, argv[0]);
  if (JS_ToUint64Ext(ctx, &register_id, argv[1]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for register_id");
  }  
  keccak256(data_len, (uint64_t)data_ptr, register_id);
  return JS_UNDEFINED;
}

static JSValue near_keccak512(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t register_id;
  const char *data_ptr;
  size_t data_len;

  data_ptr = JS_ToCStringLenRaw(ctx, &data_len, argv[0]);
  if (JS_ToUint64Ext(ctx, &register_id, argv[1]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for register_id");
  }
  
  keccak512(data_len, (uint64_t)data_ptr, register_id);
  return JS_UNDEFINED;
}

static JSValue near_ripemd160(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t register_id;
  const char *data_ptr;
  size_t data_len;

  data_ptr = JS_ToCStringLenRaw(ctx, &data_len, argv[0]);
  if (JS_ToUint64Ext(ctx, &register_id, argv[1]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for register_id");
  }
  
  ripemd160(data_len, (uint64_t)data_ptr, register_id);
  return JS_UNDEFINED;
}

static JSValue near_ecrecover(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t malleability_flag, v, register_id, result;
  const char *hash_ptr, *sig_ptr;
  size_t hash_len, sign_len;

  hash_ptr = JS_ToCStringLenRaw(ctx, &hash_len, argv[0]);
  sig_ptr = JS_ToCStringLenRaw(ctx, &sign_len, argv[1]);
  if (JS_ToUint64Ext(ctx, &malleability_flag, argv[2]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for malleability_flag");
  }
  if (JS_ToUint64Ext(ctx, &v, argv[3]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for v");
  }
  if (JS_ToUint64Ext(ctx, &register_id, argv[4]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for register_id");
  }
 
  result = ecrecover(hash_len, (uint64_t)hash_ptr, sign_len, (uint64_t)sig_ptr, malleability_flag, v, register_id);
  return JS_NewBigUint64(ctx, result);
}

static JSValue near_value_return(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) 
{
  const char *value_ptr;
  size_t value_len;

  value_ptr = JS_ToCStringLenRaw(ctx, &value_len, argv[0]);
  value_return(value_len, (uint64_t)value_ptr);
  return JS_UNDEFINED;
}

static JSValue near_panic(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  const char *data_ptr;
  size_t data_len;

  if (argc == 1) {
    data_ptr = JS_ToCStringLen(ctx, &data_len, argv[0]);
    panic_utf8(data_len, (uint64_t)data_ptr);
  } else {
    panic();
  }
  return JS_UNDEFINED;
}

static JSValue near_panic_utf8(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  const char *data_ptr;
  size_t data_len;

  data_ptr = JS_ToCStringLenRaw(ctx, &data_len, argv[0]);
  
  panic_utf8(data_len, (uint64_t)data_ptr);
  return JS_UNDEFINED;
}

static JSValue near_log(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  const char *data_ptr;
  size_t data_len;

  data_ptr = JS_ToCStringLen(ctx, &data_len, argv[0]);
  
  log_utf8(data_len, (uint64_t)data_ptr);
  return JS_UNDEFINED;
}

static JSValue near_log_utf8(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  const char *data_ptr;
  size_t data_len;

  data_ptr = JS_ToCStringLenRaw(ctx, &data_len, argv[0]);
  
  log_utf8(data_len, (uint64_t)data_ptr);
  return JS_UNDEFINED;
}

static JSValue near_log_utf16(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  const char *data_ptr;
  size_t data_len;

  data_ptr = JS_ToCStringLenRaw(ctx, &data_len, argv[0]);
  log_utf16(data_len, (uint64_t)data_ptr);
  return JS_UNDEFINED;
}

static JSValue near_promise_create(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  const char *account_id_ptr, *method_name_ptr, *arguments_ptr;
  size_t account_id_len, method_name_len, arguments_len;
  uint64_t amount_ptr[2]; // amount is u128
  uint64_t gas, ret;

  account_id_ptr = JS_ToCStringLen(ctx, &account_id_len, argv[0]);
  method_name_ptr = JS_ToCStringLen(ctx, &method_name_len, argv[1]);
  arguments_ptr = JS_ToCStringLenRaw(ctx, &arguments_len, argv[2]);
  if (quickjs_to_u128(ctx, argv[3], amount_ptr) != 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint128 for amount");
  }
  if (JS_ToUint64Ext(ctx, &gas, argv[4]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for gas");
  }

  ret = promise_create(account_id_len, (uint64_t)account_id_ptr, method_name_len, (uint64_t)method_name_ptr, arguments_len, (uint64_t)arguments_ptr, (uint64_t)amount_ptr, gas);
  
  return JS_NewBigUint64(ctx, ret);
}

static JSValue near_promise_then(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t promise_index;
  const char *account_id_ptr, *method_name_ptr, *arguments_ptr;
  size_t account_id_len, method_name_len, arguments_len;
  uint64_t amount_ptr[2]; // amount is u128
  uint64_t gas, ret;

  if (JS_ToUint64Ext(ctx, &promise_index, argv[0]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for promise_index");
  }
  account_id_ptr = JS_ToCStringLen(ctx, &account_id_len, argv[1]);
  method_name_ptr = JS_ToCStringLen(ctx, &method_name_len, argv[2]);
  arguments_ptr = JS_ToCStringLenRaw(ctx, &arguments_len, argv[3]);
  if (quickjs_to_u128(ctx, argv[4], amount_ptr) != 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint128 for amount");
  }
  if (JS_ToUint64Ext(ctx, &gas, argv[5]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for gas");
  }

  ret = promise_then(promise_index, account_id_len, (uint64_t)account_id_ptr, method_name_len, (uint64_t)method_name_ptr, arguments_len, (uint64_t)arguments_ptr, (uint64_t)amount_ptr, gas);
  
  return JS_NewBigUint64(ctx, ret);
}

static JSValue near_promise_and(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t promise_idx_ptr[argc], ret;

  for(int i = 0; i < argc; i++) {
    if (JS_ToUint64Ext(ctx, &promise_idx_ptr[i], argv[i]) < 0) {
      return JS_ThrowTypeError(ctx, "Expect Uint64 for promise_id");
    }
  }
  ret = promise_and((uint64_t)promise_idx_ptr, argc);
  return JS_NewBigUint64(ctx, ret);
}

static JSValue near_promise_batch_create(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  const char *account_id_ptr;
  size_t account_id_len;
  uint64_t ret;

  account_id_ptr = JS_ToCStringLen(ctx, &account_id_len, argv[0]);
  ret = promise_batch_create(account_id_len, (uint64_t)account_id_ptr);
  return JS_NewBigUint64(ctx, ret);
}

static JSValue near_promise_batch_then(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t promise_index;
  const char *account_id_ptr;
  size_t account_id_len;
  uint64_t ret;

  if (JS_ToUint64Ext(ctx, &promise_index, argv[0]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for promise_index");
  }
  account_id_ptr = JS_ToCStringLen(ctx, &account_id_len, argv[1]);
  ret = promise_batch_then(promise_index, account_id_len, (uint64_t)account_id_ptr);
  return JS_NewBigUint64(ctx, ret);
}

static JSValue near_promise_batch_action_create_account(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t promise_index;

  if (JS_ToUint64Ext(ctx, &promise_index, argv[0]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for promise_index");
  }
  promise_batch_action_create_account(promise_index);
  return JS_UNDEFINED;
}

static JSValue near_promise_batch_action_deploy_contract(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t promise_index;
  const char *code_ptr;
  size_t code_len;

  if (JS_ToUint64Ext(ctx, &promise_index, argv[0]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for promise_index");
  }
  code_ptr = JS_ToCStringLenRaw(ctx, &code_len, argv[1]);
  promise_batch_action_deploy_contract(promise_index, code_len, (uint64_t)code_ptr);
  return JS_UNDEFINED;
}

static JSValue near_promise_batch_action_function_call(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t promise_index;
  const char *method_name_ptr, *arguments_ptr;
  size_t method_name_len, arguments_len;
  uint64_t amount_ptr[2]; // amount is u128
  uint64_t gas;

  if (JS_ToUint64Ext(ctx, &promise_index, argv[0]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for promise_index");
  }
  method_name_ptr = JS_ToCStringLen(ctx, &method_name_len, argv[1]);
  arguments_ptr = JS_ToCStringLenRaw(ctx, &arguments_len, argv[2]);
  if (quickjs_to_u128(ctx, argv[3], amount_ptr) != 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint128 for amount");
  }
  if (JS_ToUint64Ext(ctx, &gas, argv[4]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for gas");
  }
  promise_batch_action_function_call(promise_index, method_name_len, (uint64_t)method_name_ptr, arguments_len, (uint64_t)arguments_ptr, (uint64_t)amount_ptr, gas);
  return JS_UNDEFINED;
}

static JSValue near_promise_batch_action_transfer(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t promise_index;
  uint64_t amount_ptr[2]; // amount is u128

  if (JS_ToUint64Ext(ctx, &promise_index, argv[0]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for promise_index");
  }
  if (quickjs_to_u128(ctx, argv[1], amount_ptr) != 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint128 for amount");
  }
  promise_batch_action_transfer(promise_index, (uint64_t)amount_ptr);
  return JS_UNDEFINED;
}

static JSValue near_promise_batch_action_stake(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t promise_index;
  uint64_t amount_ptr[2];
  const char *public_key_ptr;
  size_t public_key_len;

  if (JS_ToUint64Ext(ctx, &promise_index, argv[0]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for promise_index");
  }
  if (quickjs_to_u128(ctx, argv[1], amount_ptr) != 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint128 for amount");
  }
  public_key_ptr = JS_ToCStringLen(ctx, &public_key_len, argv[2]);

  promise_batch_action_stake(promise_index, (uint64_t)amount_ptr, public_key_len, (uint64_t)public_key_ptr);
  return JS_UNDEFINED;
}

static JSValue near_promise_batch_action_add_key_with_full_access(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t promise_index;
  const char *public_key_ptr;
  size_t public_key_len;
  uint64_t nonce;

  if (JS_ToUint64Ext(ctx, &promise_index, argv[0]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for promise_index");
  }
  public_key_ptr = JS_ToCStringLen(ctx, &public_key_len, argv[1]);
  if (JS_ToUint64Ext(ctx, &nonce, argv[2]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for nonce");
  }
  promise_batch_action_add_key_with_full_access(promise_index, public_key_len, (uint64_t)public_key_ptr, nonce);
  return JS_UNDEFINED;
}

static JSValue near_promise_batch_action_add_key_with_function_call(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t promise_index;
  const char *public_key_ptr, *receiver_id_ptr, *method_names_ptr;
  size_t public_key_len, receiver_id_len, method_names_len;
  uint64_t nonce, allowance_ptr[2];

  if (JS_ToUint64Ext(ctx, &promise_index, argv[0]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for promise_index");
  }
  public_key_ptr = JS_ToCStringLen(ctx, &public_key_len, argv[1]);
  if (JS_ToUint64Ext(ctx, &nonce, argv[2]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for nonce");
  }
  if (quickjs_to_u128(ctx, argv[3], allowance_ptr) != 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint128 for allowance");
  }
  receiver_id_ptr = JS_ToCStringLen(ctx, &receiver_id_len, argv[4]);
  method_names_ptr = JS_ToCStringLen(ctx, &method_names_len, argv[5]);

  promise_batch_action_add_key_with_function_call(promise_index, public_key_len, (uint64_t)public_key_ptr, nonce, (uint64_t)allowance_ptr, receiver_id_len, (uint64_t)receiver_id_ptr, method_names_len, (uint64_t)method_names_ptr);
  return JS_UNDEFINED;
}

static JSValue near_promise_batch_action_delete_key(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t promise_index;
  const char *public_key_ptr;
  size_t public_key_len;

  if (JS_ToUint64Ext(ctx, &promise_index, argv[0]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for promise_index");
  }
  public_key_ptr = JS_ToCStringLen(ctx, &public_key_len, argv[1]);
  promise_batch_action_delete_key(promise_index, public_key_len, (uint64_t)public_key_ptr);
  return JS_UNDEFINED;
}

static JSValue near_promise_batch_action_delete_account(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t promise_index;
  const char *beneficiary_id_ptr;
  size_t beneficiary_id_len;

  if (JS_ToUint64Ext(ctx, &promise_index, argv[0]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for promise_index");
  }
  beneficiary_id_ptr = JS_ToCStringLen(ctx, &beneficiary_id_len, argv[1]);
  promise_batch_action_delete_account(promise_index, beneficiary_id_len, (uint64_t)beneficiary_id_ptr);
  return JS_UNDEFINED;
}

static JSValue near_promise_results_count(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t value;

  value = promise_results_count();
  return JS_NewBigUint64(ctx, value);
}

static JSValue near_promise_result(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t result_idx, register_id;
  uint64_t ret;

  if (JS_ToUint64Ext(ctx, &result_idx, argv[0]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for result_idx");
  }
  if (JS_ToUint64Ext(ctx, &register_id, argv[1]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for register_id");
  }
  ret = promise_result(result_idx, register_id);

  return JS_NewBigUint64(ctx, ret);
}

static JSValue near_promise_return(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t promise_idx;
  if (JS_ToUint64Ext(ctx, &promise_idx, argv[0]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for promise_idx");
  }
  promise_return(promise_idx);
  
  return JS_UNDEFINED;
}

const uint64_t STORAGE_PRICE_PER_BYTE_U64 = 10000000000000000000ul;
const char *STORAGE_PRICE_PER_BYTE = "10000000000000000000";

static void mult64to128(uint64_t op1, uint64_t op2, uint64_t *hi, uint64_t *lo)
{
    uint64_t u1 = (op1 & 0xffffffff);
    uint64_t v1 = (op2 & 0xffffffff);
    uint64_t t = (u1 * v1);
    uint64_t w3 = (t & 0xffffffff);
    uint64_t k = (t >> 32);

    op1 >>= 32;
    t = (op1 * v1) + k;
    k = (t & 0xffffffff);
    uint64_t w1 = (t >> 32);

    op2 >>= 32;
    t = (u1 * op2) + k;
    k = (t >> 32);

    *hi = (op1 * op2) + w1 + k;
    *lo = (t << 32) + w3;
}

static void uint128minus(uint64_t *op1_hi, uint64_t *op1_lo, uint64_t *op2_hi, uint64_t *op2_lo) {
    *op1_lo = *op1_lo - *op2_lo;
    uint64_t c = (((*op1_lo & *op2_lo) & 1) + (*op2_lo >> 1) + (*op1_lo >> 1)) >> 63;
    *op1_hi = *op1_hi - (*op2_hi + c);
}

static void storage_cost_for_bytes(uint64_t n, uint64_t* cost) {
  // cost = n * STORAGE_PRICE_PER_BYTE
  mult64to128(n, STORAGE_PRICE_PER_BYTE_U64, cost+1, cost);
}

static bool u128_less_than(uint64_t *a, uint64_t *b) {
  return (a[1] < b[1]) || ((a[1] == b[1]) && (a[0] < b[0]));
}

static void panic_str(char *s) {
  panic_utf8(strlen(s), (uint64_t)s);
}

#define GET 0
#define SET 1

static void remaining_deposit(uint64_t *deposit, int flag) {
  static bool remain_deposit_set = false;
  static uint64_t remain_deposit[2];

  if (flag == GET) {
    if (!remain_deposit_set) {
      remain_deposit_set = true;
      attached_deposit((uint64_t)remain_deposit);
    }
    deposit[0] = remain_deposit[0];
    deposit[1] = remain_deposit[1];
  } else {
    if (!remain_deposit_set) {
      remain_deposit_set = true;
    }
    remain_deposit[0] = deposit[0];
    remain_deposit[1] = deposit[1];
  }
}

static void deduct_cost(uint64_t *cost) {
  uint64_t deposit[2];
  remaining_deposit(deposit, GET);
  if (u128_less_than(deposit, cost)) {
    panic_str("insufficient deposit for storage");
  } else {
    uint128minus(deposit+1, deposit, cost+1, cost);
    remaining_deposit(deposit, SET);
  }
}

static void refund_storage_deposit() {
  uint64_t deposit[2];
  uint64_t promise_id;
  char account[64];
  uint64_t account_len;

  predecessor_account_id(0);
  read_register(0, (uint64_t)account);
  account_len = register_len(0);

  remaining_deposit(deposit, GET);
  
  if (deposit[0] > 0 || deposit[1] > 0) {
    promise_id = promise_batch_create(account_len, (uint64_t)account);
    promise_batch_action_transfer(promise_id, (uint64_t)deposit);
    promise_return(promise_id);
  }
}

static uint64_t storage_write_enclave(uint64_t key_len, uint64_t key_ptr, uint64_t value_len, uint64_t value_ptr, uint64_t register_id) {
  uint64_t bytes;
  uint64_t cost[2];
  uint64_t ret;
  uint64_t initial = storage_usage(), after;
  ret = storage_write(key_len, key_ptr, value_len, value_ptr, register_id);
  after = storage_usage();
  storage_cost_for_bytes(after - initial, cost);
  deduct_cost(cost);
  return ret;
}

static JSValue near_storage_write(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  const char *key_ptr, *value_ptr;
  size_t key_len, value_len;
  uint64_t ret;

  key_ptr = JS_ToCStringLenRaw(ctx, &key_len, argv[0]);
  value_ptr = JS_ToCStringLenRaw(ctx, &value_len, argv[1]);
  ret = storage_write(key_len, (uint64_t)key_ptr, value_len, (uint64_t)value_ptr, 0);
  return JS_NewBigUint64(ctx, ret);
}

static JSValue near_storage_read(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  const char *key_ptr;
  size_t key_len;
  uint64_t register_id;
  uint64_t ret;

  key_ptr = JS_ToCStringLenRaw(ctx, &key_len, argv[0]);
  if (JS_ToUint64Ext(ctx, &register_id, argv[1]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for register_id");
  }
  ret = storage_read(key_len, (uint64_t)key_ptr, register_id);
  return JS_NewBigUint64(ctx, ret);
}

static JSValue near_storage_remove(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  const char *key_ptr;
  size_t key_len;
  uint64_t register_id;
  uint64_t ret;

  key_ptr = JS_ToCStringLenRaw(ctx, &key_len, argv[0]);
  if (JS_ToUint64Ext(ctx, &register_id, argv[1]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for register_id");
  }
  ret = storage_remove(key_len, (uint64_t)key_ptr, register_id);
  return JS_NewBigUint64(ctx, ret);
}

static JSValue near_storage_has_key(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  const char *key_ptr;
  size_t key_len;
  uint64_t ret;

  key_ptr = JS_ToCStringLenRaw(ctx, &key_len, argv[0]);
  ret = storage_has_key(key_len, (uint64_t)key_ptr);
  return JS_NewBigUint64(ctx, ret);
}

static JSValue near_validator_stake(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  const char *account_id_ptr;
  size_t account_id_len;
  uint64_t stake_ptr[2];

  account_id_ptr = JS_ToCStringLen(ctx, &account_id_len, argv[0]);
  validator_stake(account_id_len, (uint64_t)account_id_ptr, (uint64_t)stake_ptr);

  return u128_to_quickjs(ctx, stake_ptr);
}

static JSValue near_validator_total_stake(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t stake_ptr[2];

  validator_total_stake((uint64_t)stake_ptr);
  return u128_to_quickjs(ctx, stake_ptr);
}

static JSValue near_storage_byte_cost(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv) {
  JSValue value;
  bf_t *a;
  
  value = JS_NewBigInt(ctx);
  a = JS_GetBigInt(value);
  bf_atof(a, STORAGE_PRICE_PER_BYTE, NULL, 10, BF_PREC_INF, BF_RNDZ);
  return value;
}

#ifdef NIGHTLY
static JSValue near_alt_bn128_g1_multiexp(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t register_id;
  const char *data_ptr;
  size_t data_len;

  data_ptr = JS_ToCStringLenRaw(ctx, &data_len, argv[0]);
  if (JS_ToUint64Ext(ctx, &register_id, argv[1]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for register_id");
  }

  alt_bn128_g1_multiexp(data_len, (uint64_t)data_ptr, register_id);
  return JS_UNDEFINED;
}

static JSValue near_alt_bn128_g1_sum(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  uint64_t register_id;
  const char *data_ptr;
  size_t data_len;

  data_ptr = JS_ToCStringLenRaw(ctx, &data_len, argv[0]);
  if (JS_ToUint64Ext(ctx, &register_id, argv[1]) < 0) {
    return JS_ThrowTypeError(ctx, "Expect Uint64 for register_id");
  }

  alt_bn128_g1_sum(data_len, (uint64_t)data_ptr, register_id);
  return JS_UNDEFINED;
}

static JSValue near_alt_bn128_pairing_check(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv)
{
  const char *data_ptr;
  size_t data_len;
  uint64_t ret;

  data_ptr = JS_ToCStringLenRaw(ctx, &data_len, argv[0]);
  
  ret = alt_bn128_pairing_check(data_len, (uint64_t)data_ptr);
  return JS_NewBigUint64(ctx, ret);
}
#endif

static void js_add_near_host_functions(JSContext* ctx) {
  JSValue global_obj, env;

  global_obj = JS_GetGlobalObject(ctx);
  env = JS_NewObject(ctx);

  JS_SetPropertyStr(ctx, env, "read_register", JS_NewCFunction(ctx, near_read_register, "read_register", 1));
  JS_SetPropertyStr(ctx, env, "register_len", JS_NewCFunction(ctx, near_register_len, "register_len", 1));
  JS_SetPropertyStr(ctx, env, "write_register", JS_NewCFunction(ctx, near_write_register, "write_register", 2));
  JS_SetPropertyStr(ctx, env, "current_account_id", JS_NewCFunction(ctx, near_current_account_id, "current_account_id", 1));
  JS_SetPropertyStr(ctx, env, "signer_account_id", JS_NewCFunction(ctx, near_signer_account_id, "signer_account_id", 1));
  JS_SetPropertyStr(ctx, env, "signer_account_pk", JS_NewCFunction(ctx, near_signer_account_pk, "signer_account_pk", 1));
  JS_SetPropertyStr(ctx, env, "predecessor_account_id", JS_NewCFunction(ctx, near_predecessor_account_id, "predecessor_account_id", 1));
  JS_SetPropertyStr(ctx, env, "input", JS_NewCFunction(ctx, near_input, "input", 1));
  JS_SetPropertyStr(ctx, env, "block_index", JS_NewCFunction(ctx, near_block_index, "block_index", 0));
  JS_SetPropertyStr(ctx, env, "block_timestamp", JS_NewCFunction(ctx, near_block_timestamp, "block_timestamp", 0));
  JS_SetPropertyStr(ctx, env, "epoch_height", JS_NewCFunction(ctx, near_epoch_height, "epoch_height", 0));
  JS_SetPropertyStr(ctx, env, "storage_usage", JS_NewCFunction(ctx, near_storage_usage, "storage_usage", 0));
  JS_SetPropertyStr(ctx, env, "account_balance", JS_NewCFunction(ctx, near_account_balance, "account_balance", 0));
  JS_SetPropertyStr(ctx, env, "account_locked_balance", JS_NewCFunction(ctx, near_account_locked_balance, "account_locked_balance", 0));
  JS_SetPropertyStr(ctx, env, "attached_deposit", JS_NewCFunction(ctx, near_attached_deposit, "attached_deposit", 0));
  JS_SetPropertyStr(ctx, env, "prepaid_gas", JS_NewCFunction(ctx, near_prepaid_gas, "prepaid_gas", 0));
  JS_SetPropertyStr(ctx, env, "used_gas", JS_NewCFunction(ctx, near_used_gas, "used_gas", 0));
  JS_SetPropertyStr(ctx, env, "random_seed", JS_NewCFunction(ctx, near_random_seed, "random_seed", 1));
  JS_SetPropertyStr(ctx, env, "sha256", JS_NewCFunction(ctx, near_sha256, "sha256", 2));
  JS_SetPropertyStr(ctx, env, "keccak256", JS_NewCFunction(ctx, near_keccak256, "keccak256", 2));
  JS_SetPropertyStr(ctx, env, "keccak512", JS_NewCFunction(ctx, near_keccak512, "keccak512", 2));
  JS_SetPropertyStr(ctx, env, "ripemd160", JS_NewCFunction(ctx, near_ripemd160, "ripemd160", 2));
  JS_SetPropertyStr(ctx, env, "ecrecover", JS_NewCFunction(ctx, near_ecrecover, "ecrecover", 5));
  JS_SetPropertyStr(ctx, env, "value_return", JS_NewCFunction(ctx, near_value_return, "value_return", 1));
  JS_SetPropertyStr(ctx, env, "panic", JS_NewCFunction(ctx, near_panic, "panic", 1));
  JS_SetPropertyStr(ctx, env, "panic_utf8", JS_NewCFunction(ctx, near_panic_utf8, "panic_utf8", 1));
  JS_SetPropertyStr(ctx, env, "log", JS_NewCFunction(ctx, near_log, "log", 1));
  JS_SetPropertyStr(ctx, env, "log_utf8", JS_NewCFunction(ctx, near_log_utf8, "log_utf8", 1));
  JS_SetPropertyStr(ctx, env, "log_utf16", JS_NewCFunction(ctx, near_log_utf16, "log_utf16", 1));
  JS_SetPropertyStr(ctx, env, "promise_create", JS_NewCFunction(ctx, near_promise_create, "promise_create", 5));
  JS_SetPropertyStr(ctx, env, "promise_then", JS_NewCFunction(ctx, near_promise_then, "promise_then", 6));
  JS_SetPropertyStr(ctx, env, "promise_and", JS_NewCFunction(ctx, near_promise_and, "promise_and", 1));
  JS_SetPropertyStr(ctx, env, "promise_batch_create", JS_NewCFunction(ctx, near_promise_batch_create, "promise_batch_create", 1));
  JS_SetPropertyStr(ctx, env, "promise_batch_then", JS_NewCFunction(ctx, near_promise_batch_then, "promise_batch_then", 2));
  JS_SetPropertyStr(ctx, env, "promise_batch_action_create_account", JS_NewCFunction(ctx, near_promise_batch_action_create_account, "promise_batch_action_create_account", 1));
  JS_SetPropertyStr(ctx, env, "promise_batch_action_deploy_contract", JS_NewCFunction(ctx, near_promise_batch_action_deploy_contract, "promise_batch_action_deploy_contract", 2));
  JS_SetPropertyStr(ctx, env, "promise_batch_action_function_call", JS_NewCFunction(ctx, near_promise_batch_action_function_call, "promise_batch_action_function_call", 5));
  JS_SetPropertyStr(ctx, env, "promise_batch_action_transfer", JS_NewCFunction(ctx, near_promise_batch_action_transfer, "promise_batch_action_transfer", 2));
  JS_SetPropertyStr(ctx, env, "promise_batch_action_stake", JS_NewCFunction(ctx, near_promise_batch_action_stake, "promise_batch_action_stake", 3));
  JS_SetPropertyStr(ctx, env, "promise_batch_action_add_key_with_full_access", JS_NewCFunction(ctx, near_promise_batch_action_add_key_with_full_access, "promise_batch_action_add_key_with_full_access", 3));
  JS_SetPropertyStr(ctx, env, "promise_batch_action_add_key_with_function_call", JS_NewCFunction(ctx, near_promise_batch_action_add_key_with_function_call, "promise_batch_action_add_key_with_function_call", 6));
  JS_SetPropertyStr(ctx, env, "promise_batch_action_delete_key", JS_NewCFunction(ctx, near_promise_batch_action_delete_key, "promise_batch_action_delete_key", 2));
  JS_SetPropertyStr(ctx, env, "promise_batch_action_delete_account", JS_NewCFunction(ctx, near_promise_batch_action_delete_account, "promise_batch_action_delete_account", 2));
  JS_SetPropertyStr(ctx, env, "promise_results_count", JS_NewCFunction(ctx, near_promise_results_count, "promise_results_count", 0));
  JS_SetPropertyStr(ctx, env, "promise_result", JS_NewCFunction(ctx, near_promise_result, "promise_result", 2));
  JS_SetPropertyStr(ctx, env, "promise_return", JS_NewCFunction(ctx, near_promise_return, "promise_return", 1));
  JS_SetPropertyStr(ctx, env, "storage_write", JS_NewCFunction(ctx, near_storage_write, "storage_write", 2));
  JS_SetPropertyStr(ctx, env, "storage_read", JS_NewCFunction(ctx, near_storage_read, "storage_read", 2));
  JS_SetPropertyStr(ctx, env, "storage_remove", JS_NewCFunction(ctx, near_storage_remove, "storage_remove", 2));
  JS_SetPropertyStr(ctx, env, "storage_has_key", JS_NewCFunction(ctx, near_storage_has_key, "storage_has_key", 2));
  JS_SetPropertyStr(ctx, env, "validator_stake", JS_NewCFunction(ctx, near_validator_stake, "validator_stake", 2));
  JS_SetPropertyStr(ctx, env, "validator_total_stake", JS_NewCFunction(ctx, near_validator_total_stake, "validator_total_stake", 1));
  #ifdef NIGHTLY
  JS_SetPropertyStr(ctx, env, "alt_bn128_g1_multiexp", JS_NewCFunction(ctx, near_alt_bn128_g1_multiexp, "alt_bn128_g1_multiexp", 2));
  JS_SetPropertyStr(ctx, env, "alt_bn128_g1_sum", JS_NewCFunction(ctx, near_alt_bn128_g1_sum, "alt_bn128_g1_sum", 2));
  JS_SetPropertyStr(ctx, env, "alt_bn128_pairing_check", JS_NewCFunction(ctx, near_alt_bn128_pairing_check, "alt_bn128_pairing_check", 1));
  #endif

  JS_SetPropertyStr(ctx, global_obj, "env", env);
}

JSValue JS_Call(JSContext *ctx, JSValueConst func_obj, JSValueConst this_obj,
                int argc, JSValueConst *argv) ;

void _start() {}

void deploy_js_contract () __attribute__((export_name("deploy_js_contract"))) {
  char account[64], *code;
  size_t account_len, code_len;
  char key[69];

  predecessor_account_id(0);
  read_register(0, (uint64_t)account);
  account_len = register_len(0);

  input(1);
  code_len = register_len(1);
  code = malloc(code_len);
  read_register(1, (uint64_t)code);
  strncpy(key, account, account_len);
  strncpy(key+account_len, "/code", 5);
  storage_write_enclave(account_len+5, (uint64_t)key, code_len, (uint64_t)code, 2);
  refund_storage_deposit();
}

void call_js_contract () __attribute__((export_name("call_js_contract"))) {
  char *in, *code, *contract, *method, *args;
  size_t contract_len = 0, method_len = 0, args_len = 0;
  size_t code_len, in_len;
  char key[69];
  int has_read;

  JSRuntime *rt;
  JSContext *ctx;
  JSValue mod_obj, fun_obj, result, error, error_message, error_stack;
  const char *error_message_c, *error_stack_c;
  char *error_c;
  size_t msg_len, stack_len;

  input(0);
  in_len = register_len(0);
  in = malloc(in_len);
  read_register(0, (uint64_t)in);
  for (size_t i = 0; i < in_len; i++) {
    if (in[i] == '\0') {
      contract_len = i;
      contract = in;
      break;
    }
  }
  for (size_t i = contract_len+1; i < in_len; i++) {
    if (in[i] == '\0') {
      method = in + contract_len + 1;
      method_len = i - contract_len - 1;
      args_len = in_len - contract_len - method_len - 2;
      args = in + i + 1;
      break;
    }
  }
  if (method_len == 0 || contract_len == 0 || contract_len > 64) {
    // argument error
    panic();
  }

  // todo: env.input should return args, instead of in.
  strncpy(key, contract, contract_len);
  strncpy(key+contract_len, "/code", 5);
  has_read = storage_read(contract_len+5, (uint64_t)key, 1);
  if (!has_read) {
    panic();
  }
  code_len = register_len(1);
  code = malloc(code_len);
  read_register(1, (uint64_t)code);

  rt = JS_NewRuntime();
  ctx = JS_NewCustomContext(rt);
  js_add_near_host_functions(ctx);
  mod_obj = js_load_module_binary(ctx, (const uint8_t *)code, code_len);
  fun_obj = JS_GetProperty(ctx, mod_obj, JS_NewAtom(ctx, method));
  result = JS_Call(ctx, fun_obj, mod_obj, 0, NULL);
  if (JS_IsException(result)) {
    error = JS_GetException(ctx);
    error_message = JS_GetPropertyStr(ctx, error, "message");
    error_stack = JS_GetPropertyStr(ctx, error, "stack");
    error_message_c = JS_ToCStringLen(ctx, &msg_len, error_message);
    error_stack_c = JS_ToCStringLen(ctx, &stack_len, error_stack);
    error_c = malloc(msg_len+1+stack_len);
    strncpy(error_c, error_message_c, msg_len);
    error_c[msg_len] = '\n';
    strncpy(error_c+msg_len+1, error_stack_c, stack_len);
    panic_utf8(msg_len+1+stack_len, (uint64_t)error_c);
  }
  js_std_loop(ctx);
  refund_storage_deposit(); 
}