'use strict';

const contractsService = require('./contracts.service');
const { ok, successResponse } = require('../../utils/response');

// =============================================================================
// CONTRACTS CONTROLLER
// =============================================================================

async function getContracts(req, res, next) {
  try {
    const result = await contractsService.findAll(req.user, req.query);
    return successResponse(res, {
      message: 'Daftar contract berhasil diambil.',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    return next(error);
  }
}

async function getContractById(req, res, next) {
  try {
    const contract = await contractsService.findById(req.params.id, req.user);
    return ok(res, contract, 'Detail contract berhasil diambil.');
  } catch (error) {
    return next(error);
  }
}

async function startContract(req, res, next) {
  try {
    const contract = await contractsService.startContract(req.params.id, req.user);
    return ok(res, contract, 'Pengerjaan contract telah dimulai.');
  } catch (error) {
    return next(error);
  }
}

async function finishContract(req, res, next) {
  try {
    const contract = await contractsService.finishContract(
      req.params.id,
      req.user,
      req.body.workNote,
    );
    return ok(res, contract, 'Hasil pekerjaan berhasil dikirimkan. Menunggu konfirmasi client.');
  } catch (error) {
    return next(error);
  }
}

async function cancelContract(req, res, next) {
  try {
    const contract = await contractsService.cancelContract(
      req.params.id,
      req.user,
      req.body.cancellationReason,
    );
    return ok(res, contract, 'Contract berhasil dibatalkan.');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getContracts,
  getContractById,
  startContract,
  finishContract,
  cancelContract,
};
