# Release

This document describes step to do a new pre-release or formal release.

## Release Requirement
- A formal release must be directly bump from a tested, DevRel Team approved pre-release, with no commits other than bump the version.
- Pre-release can come with arbitrary commits to fix packaging and update documentations. Several pre-release can be released before a formal release to fix issues and address feedbacks.

## Steps for pre-release
1. Create a new branch for the release.
2. Bump version in packages/near-sdk-js/package.json and packages/near-contract-standards/package.json to the version about to release. It should be `x.y.z-0`, and next pre-release `x.y.z-1`, etc.
3. Run `pnpm release` in packages/near-sdk-js and in packages/near-contract-standards.
4. Copy examples folder in this repo to another place, drop `node_modules`, change its package.json from:
```
    "near-contract-standards": "workspace:*",
    "near-sdk-js": "workspace:*",
```
to the version you just released, e.g. `x.y.z-1`.
5. Build and run example tests to ensure the packaging is correct.
6. If it works, go to https://github.com/near/near-sdk-js/releases/new, create a tag for the new release from the branch you created in step 1, and write the release highlights.
7. Ask the DevRel team to test the pre-release.

## Steps for formal release
1. Create a new release branch from the candidate pre-release branch
2. Bump version in packages/near-sdk-js/package.json and packages/near-contract-standards/package.json to the version about to release. It should be `x.y.z`.
3. Run `pnpm release` in packages/near-sdk-js and in packages/near-contract-standards.
4. Go to https://github.com/near/near-sdk-js/releases/new, create a tag for the new release branch from the branch you created in step 1, and copy the highlights from latest pre-release candidate.
5. Advertise it to the community!