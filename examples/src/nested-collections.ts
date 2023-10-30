import {NearBindgen, near, call, view, UnorderedMap, LookupMap, LookupSet, UnorderedSet, Vector} from "near-sdk-js";

@NearBindgen({})
export class Contract {
  outerMap: UnorderedMap<UnorderedMap<string>>;
  groups: UnorderedMap<UnorderedMap<UnorderedMap<string>>>;
  outerLkpSet: UnorderedMap<LookupSet<string>>;
  outerSet: UnorderedMap<UnorderedSet<string>>;
  outerVec: UnorderedMap<Vector<string>>;
  outerLkMap: UnorderedMap<LookupMap<string>>;

  constructor() {
    this.outerMap = new UnorderedMap("o");
    this.groups = new UnorderedMap("gs");
    this.outerLkpSet = new UnorderedMap("ols");
    this.outerSet = new UnorderedMap("os");
    this.outerVec = new UnorderedMap("ov");
    this.outerLkMap = new UnorderedMap("olk");
  }

  @call({})
  add({ id, text }: { id: string; text: string }) {
    const innerMap = this.outerMap.get(id, {
      defaultValue: new UnorderedMap<string>("i_" + id + "_"),
    });
    innerMap.set(near.signerAccountId(), text);
    this.outerMap.set(id, innerMap);
  }

  @view({})
  get({ id, accountId }: { id: string; accountId: string }) {
    const innerMap = this.outerMap.get(id);
    if (innerMap === null) {
      return null;
    }
    return innerMap.get(accountId);
  }

  @call({})
  add_to_group({
    group,
    id,
    text,
  }: {
    group: string;
    id: string;
    text: string;
  }) {
    const groupMap = this.groups.get(group, {
      defaultValue: new UnorderedMap<UnorderedMap<string>>("g_" + group + "_"),
    });
    const innerMap = groupMap.get(id, {
      defaultValue: new UnorderedMap<string>("gi_" + group + "_" + id + "_"),
    });
    innerMap.set(near.signerAccountId(), text);
    groupMap.set(id, innerMap);
    this.groups.set(group, groupMap);
  }

  @view({})
  get_from_group({
    group,
    id,
    accountId,
  }: {
    group: string;
    id: string;
    accountId: string;
  }) {
    const groupMap = this.groups.get(group);
    if (groupMap === null) {
      return null;
    }
    const innerMap = groupMap.get(id);
    if (innerMap === null) {
      return null;
    }
    return innerMap.get(accountId);
  }

  @call({})
  add_lk_set({ id }: { id: string }) {
    const innerSet = this.outerLkpSet.get(id, {
      defaultValue: new LookupSet<string>("i_" + id + "_"),
    });
    innerSet.set(near.signerAccountId());
    this.outerLkpSet.set(id, innerSet);
  }

  @view({})
  get_lk_set({ id, accountId }: { id: string; accountId: string }) {
    const innerMap = this.outerLkpSet.get(id);
    if (innerMap === null) {
      return null;
    }
    return innerMap.contains(accountId);
  }

  @call({})
  add_lk_vec({ id, value }: { id: string, value: string }) {
    const innerVec = this.outerVec.get(id, {
      defaultValue: new Vector<string>("i_" + id + "_"),
    });
    innerVec.push(value);
    this.outerVec.set(id, innerVec);
  }

  @view({})
  get_lk_vec({ id, index }: { id: string; index: number }) {
    const innerVec = this.outerVec.get(id);
    if (innerVec === null) {
      return null;
    }
    return innerVec.get(index);
  }

  @call({})
  add_lk_map({ id, text }: { id: string; text: string }) {
    const innerMap = this.outerLkMap.get(id, {
      defaultValue: new LookupMap<string>("i_" + id + "_"),
    });
    innerMap.set(near.signerAccountId(), text);
    this.outerLkMap.set(id, innerMap);
  }

  @view({})
  get_lk_map({ id, accountId }: { id: string; accountId: string }) {
    const innerMap = this.outerLkMap.get(id, {
      reconstructor: LookupMap.reconstruct,
    });
    if (innerMap === null) {
      return null;
    }
    return innerMap.get(accountId);
  }
}
